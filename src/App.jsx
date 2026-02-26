import { useState, useEffect } from 'react';
import './index.css';

function App() {
  // Estados de Onboarding
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [step, setStep] = useState(localStorage.getItem('token') ? (localStorage.getItem('llm_apiKey') ? 4 : 0) : -1); // -1: Login, 0: Config IA, ...
  const [questionnaire, setQuestionnaire] = useState({
    role: '',
    roleOther: '',
    goals: [], // Ahora es un array para multi-selección
    goalsOther: '',
    challenges: [], // Ahora es un array para multi-selección
    challengesOther: ''
  });
  const [profileInput, setProfileInput] = useState('');
  const [identitySummary, setIdentitySummary] = useState('');
  
  // Estados de Operación
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [generationLoading, setGenerationLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');

  const [voiceSamples, setVoiceSamples] = useState('');
  const [voiceDna, setVoiceDna] = useState('');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState(''); // Nuevo estado para linkedinUrl

  const [activeTab, setActiveTab] = useState('analyze');

  // Estados de Configuración de IA (BYOK)
  const [llmConfig, setLlmConfig] = useState(() => {
    const savedModel = localStorage.getItem('llm_model');
    // Forzar actualización si es una versión antigua o inválida
    const model = (savedModel === 'gemini-1.5-flash' || savedModel === 'gemini-2.0-flash') 
      ? 'gemini-2.5-flash' 
      : (savedModel || 'gemini-2.5-flash');
      
    if (savedModel && savedModel !== model) {
      localStorage.setItem('llm_model', model);
    }

    return {
      provider: localStorage.getItem('llm_provider') || 'google',
      model: model,
      apiKey: localStorage.getItem('llm_apiKey') || ''
    };
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleGoogleLogin = async (response) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential })
      });
      const data = await res.json();
      if (data.accessToken) {
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setStep(llmConfig.apiKey ? 4 : 0);
      } else {
        alert("Error al iniciar sesión");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setStep(-1);
  };

  useEffect(() => {
    /* global google */
    if (step === -1) {
      google.accounts.id.initialize({
        client_id: "139562438090-fjuiklqmmq3vrr2b5h6gu5s28fi7odlp.apps.googleusercontent.com",
        callback: handleGoogleLogin
      });
      google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", text: "signin_with", width: "100%" }
      );
    }
  }, [step]);

  const saveLlmConfig = (newConfig) => {
    setLlmConfig(newConfig);
    localStorage.setItem('llm_provider', newConfig.provider);
    localStorage.setItem('llm_model', newConfig.model);
    localStorage.setItem('llm_apiKey', newConfig.apiKey);
  };

  // Opciones predefinidas
  const roles = ["Desarrollador de IA", "Estratega de Contenido", "Founder / CEO", "Consultor / Freelance", "Otros"];
  const goalsOptions = ["Generar Leads / Ventas", "Autoridad / Marca Personal", "Networking", "Educación / Comunidad", "Otros"];
  const challengesOptions = ["Falta de tiempo", "No sé de qué hablar", "Bajo engagement", "Cero consistencia", "Otros"];

  // Handlers para selección múltiple
  const toggleGoal = (goal) => {
    if (questionnaire.goals.includes(goal)) {
      setQuestionnaire({ ...questionnaire, goals: questionnaire.goals.filter(g => g !== goal) });
    } else if (questionnaire.goals.length < 3) {
      setQuestionnaire({ ...questionnaire, goals: [...questionnaire.goals, goal] });
    }
  };

  const toggleChallenge = (challenge) => {
    if (questionnaire.challenges.includes(challenge)) {
      setQuestionnaire({ ...questionnaire, challenges: questionnaire.challenges.filter(c => c !== challenge) });
    } else if (questionnaire.challenges.length < 3) {
      setQuestionnaire({ ...questionnaire, challenges: [...questionnaire.challenges, challenge] });
    }
  };

  const handleIdentityGeneration = async () => {
    setLoading(true);
    try {
      if (!llmConfig.apiKey) {
        setStep(0); // Volver al inicio si borró la llave
        setLoading(false);
        return;
      }

      const finalQuestionnaire = {
        role: questionnaire.role === 'Otros' ? questionnaire.roleOther : questionnaire.role,
        goals: questionnaire.goals.includes('Otros') 
          ? [...questionnaire.goals.filter(g => g !== 'Otros'), questionnaire.goalsOther]
          : questionnaire.goals,
        challenges: questionnaire.challenges.includes('Otros')
          ? [...questionnaire.challenges.filter(c => c !== 'Otros'), questionnaire.challengesOther]
          : questionnaire.challenges
      };

      let profileText = profileInput;
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      if (profileInput.startsWith('http')) {
        setLinkedinUrl(profileInput); // Capturar la URL
        try {
          const scrapeRes = await fetch(`${API_URL}/api/analyze-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: profileInput, llmConfig })
          });
          const scrapeData = await scrapeRes.json();
          
          if (scrapeData.error || (scrapeData.rawData && (scrapeData.rawData.raw.includes('authwall') || scrapeData.rawData.raw.includes('unauthorized')))) {
            throw new Error("LinkedIn bloqueó el acceso. Por favor pega el texto manualmente.");
          }
          profileText = scrapeData.rawData?.raw || profileInput;
        } catch (e) {
          alert("LinkedIn bloqueó la conexión automática. Por favor, pega el texto de tu 'Acerca de' o tu experiencia directamente en el cuadro.");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${API_URL}/api/generate-identity`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          profileData: profileText, 
          questionnaire: finalQuestionnaire,
          url: linkedinUrl,
          llmConfig
        })
      });
      const result = await res.json();
      
      if (res.ok && result.identitySummary) {
        setIdentitySummary(result.identitySummary);
        setStep(3);
      } else {
        throw new Error(result.error || "El servidor de IA no respondió correctamente.");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmIdentity = () => setStep(4);

  const handleGenerate = async () => {
    if (!linkedinUrl && profileInput.startsWith('http')) {
      setLinkedinUrl(profileInput);
    }
    
    setGenerationLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/generate-post`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          topic, 
          context: identitySummary + "\nDNA de Voz: " + voiceDna,
          url: linkedinUrl || (profileInput.startsWith('http') ? profileInput : 'manual'),
          llmConfig
        })
      });
      const result = await response.json();
      setGeneratedPost(result.post);
    } catch (error) {
      alert('Error al generar el post.');
    } finally {
      setGenerationLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="onboarding-container" key="step1">
        <div className="onboarding-card">
          <h2>Personalicemos tu IA</h2>
          <p>Dinos quién eres y qué buscas (máx. 3 metas).</p>
          
          <div className="input-group">
            <label>¿Qué describe mejor tu rol?</label>
            <select 
              className="custom-select"
              value={questionnaire.role}
              onChange={(e) => setQuestionnaire({...questionnaire, role: e.target.value})}
            >
              <option value="">Selecciona una opción...</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {questionnaire.role === 'Otros' && (
              <input 
                type="text" 
                placeholder="Dinos tu rol personalizado..." 
                value={questionnaire.roleOther}
                onChange={(e) => setQuestionnaire({...questionnaire, roleOther: e.target.value})}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>

          <div className="input-group">
            <label>¿Tus metas principales? (Máx. 3 seleccionadas)</label>
            <div className="chip-container">
              {goalsOptions.map(g => (
                <div 
                  key={g} 
                  className={`chip ${questionnaire.goals.includes(g) ? 'active' : ''}`}
                  onClick={() => toggleGoal(g)}
                >
                  {g}
                </div>
              ))}
            </div>
            {questionnaire.goals.includes('Otros') && (
              <input 
                type="text" 
                placeholder="Dinos tu meta personalizada..." 
                value={questionnaire.goalsOther}
                onChange={(e) => setQuestionnaire({...questionnaire, goalsOther: e.target.value})}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>

          <div className="input-group">
            <label>¿Qué desafíos enfrentas? (Máx. 3 seleccionados)</label>
            <div className="chip-container">
              {challengesOptions.map(c => (
                <div 
                  key={c} 
                  className={`chip ${questionnaire.challenges.includes(c) ? 'active' : ''}`}
                  onClick={() => toggleChallenge(c)}
                >
                  {c}
                </div>
              ))}
            </div>
            {questionnaire.challenges.includes('Otros') && (
              <input 
                type="text" 
                placeholder="Cuéntanos tu desafío..." 
                value={questionnaire.challengesOther}
                onChange={(e) => setQuestionnaire({...questionnaire, challengesOther: e.target.value})}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>

          <button onClick={() => setStep(2)} disabled={!questionnaire.role || questionnaire.goals.length === 0}>
            Continuar →
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="onboarding-container" key="step2">
        <div className="onboarding-card">
          <h2>Conecta tu LinkedIn</h2>
          <p>Copia el URL de tu perfil o el texto de tu sección "Acerca de".</p>
          <textarea 
            placeholder="Paga tu URL o el texto de tu perfil de LinkedIn aquí..."
            value={profileInput}
            onChange={(e) => setProfileInput(e.target.value)}
            rows={6}
            style={{ width: '100%', marginBottom: '20px' }}
          />
          <button onClick={handleIdentityGeneration} disabled={loading || !profileInput}>
            {loading ? 'Analizando Identidad...' : 'Entrenar mi IA →'}
          </button>
          <button onClick={() => setStep(1)} className="btn-secondary">Atrás</button>
          <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.6 }}>Opcional: Si el URL falla, pega tu CV o biografía directamente.</p>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="onboarding-container" key="step3">
        <div className="identity-summary">
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>LO QUE APRENDIMOS DE TI</h2>
          <div className="summary-wrapper">
             <div className="summary-text">{identitySummary}</div>
          </div>
          <div className="confirmation-actions">
            <h3>¿Te sientes identificado con esto?</h3>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={handleConfirmIdentity} style={{ width: 'auto', padding: '18px 40px' }}>Sí, vamos a escribir 🚀</button>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ width: 'auto', padding: '10px 20px', marginTop: '0' }}>No exactamente / Editar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === -1) {
    return (
      <div className="onboarding-container" key="login">
        <div className="onboarding-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚀</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>VibeCheck AI</h1>
          <p style={{ opacity: 0.8, marginBottom: '30px' }}>Potencia tu LinkedIn con IA de forma segura.</p>
          <div id="googleBtn" style={{ minHeight: '40px' }}></div>
          {loading && <p style={{ marginTop: '15px' }}>Iniciando sesión...</p>}
        </div>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="onboarding-container" key="step0">
        <div className="onboarding-card" style={{ maxWidth: '500px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔑</div>
          <h2>Configura tu Cerebro</h2>
          <p>Bienvenido. Para que la IA aprenda sobre ti de forma ilimitada, usa tu propia API Key.</p>
          
          <div className="input-group" style={{ textAlign: 'left' }}>
            <label>1. Elige tu proveedor</label>
            <select 
              className="custom-select"
              value={llmConfig.provider}
              onChange={(e) => saveLlmConfig({
                ...llmConfig, 
                provider: e.target.value, 
                model: e.target.value === 'openai' ? 'gpt-4o-mini' : 
                       e.target.value === 'google' ? 'gemini-2.5-flash' : 
                       e.target.value === 'anthropic' ? 'claude-3-5-sonnet-20240620' :
                       'deepseek-chat'
              })}
            >
              <option value="google">Google (Gemini 2.5 Flash)</option>
              <option value="openai">OpenAI (ChatGPT)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="mistral">Mistral AI</option>
              <option value="qwen">Qwen (Alibaba)</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>

          <div className="input-group" style={{ textAlign: 'left' }}>
            <label>2. Pega tu API Key</label>
            <input 
              type="password" 
              placeholder="Pega tu llave aquí..."
              value={llmConfig.apiKey}
              onChange={(e) => saveLlmConfig({...llmConfig, apiKey: e.target.value})}
            />
            <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '5px' }}>Tus datos se guardan solo en este navegador de forma segura.</p>
          </div>

          <button onClick={() => setStep(1)} disabled={!llmConfig.apiKey}>
            Guardar y Comenzar →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={user?.profile_picture} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{user?.full_name}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className="btn-secondary" style={{ width: 'auto', padding: '8px 16px', margin: 0 }}>Cerrar Sesión</button>
      </header>
      <nav style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)' }}>
        <button onClick={() => setActiveTab('analyze')} className={activeTab === 'analyze' ? 'tab-active' : ''}>Estrategia</button>
        <button onClick={() => setActiveTab('voice')} className={activeTab === 'voice' ? 'tab-active' : ''}>Voz (Ghostwriter)</button>
        <button onClick={() => setActiveTab('config')} className={activeTab === 'config' ? 'tab-active' : ''}>Configuración IA</button>
      </nav>

      <div className="main-content">
        {activeTab === 'analyze' && (
          <div className="results">
            <div className="card">
              <h3>Identidad Estratégica</h3>
              {identitySummary ? (
                <div className="post-preview" style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{identitySummary}</div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ opacity: 0.6, marginBottom: '15px' }}>Aún no has analizado tu perfil.</p>
                  <button onClick={() => setStep(1)} className="btn-secondary">Analizar Perfil ahora</button>
                </div>
              )}
            </div>
            
            <div className="card">
              <h3>Generador de Posts</h3>
              <input 
                type="text" 
                placeholder="¿De qué quieres hablar hoy?" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ marginBottom: '10px' }}
              />
              <button onClick={handleGenerate} disabled={generationLoading || !topic}>
                {generationLoading ? 'Generando...' : 'Crear Borrador Viral'}
              </button>
              
              {generatedPost && (
                <div style={{ marginTop: '20px' }}>
                  <pre className="post-preview">{generatedPost}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="card">
            <h3>Configuración de Cerebro (LLM)</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px' }}>Usa tus propias llaves para evitar límites y costos extra.</p>
            
            <div className="input-group">
              <label>Proveedor</label>
              <select 
                className="custom-select"
                value={llmConfig.provider}
                onChange={(e) => saveLlmConfig({
                  ...llmConfig, 
                  provider: e.target.value, 
                  model: e.target.value === 'openai' ? 'gpt-4o-mini' : 
                         e.target.value === 'google' ? 'gemini-2.5-flash' : 
                         e.target.value === 'mistral' ? 'mistral-small-latest' :
                         e.target.value === 'qwen' ? 'qwen-plus' :
                         e.target.value === 'anthropic' ? 'claude-3-5-sonnet-20240620' :
                         'deepseek-chat'
                })}
              >
                <option value="google">Google (Gemini)</option>
                <option value="openai">OpenAI (ChatGPT)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="deepseek">DeepSeek (China)</option>
                <option value="mistral">Mistral AI (Francia)</option>
                <option value="qwen">Qwen (Alibaba)</option>
              </select>
            </div>

            <div className="input-group">
              <label>Modelo</label>
              <input 
                type="text" 
                placeholder="Ej: gemini-1.5-flash, gpt-4o, claude-3-5-sonnet-20240620"
                value={llmConfig.model}
                onChange={(e) => saveLlmConfig({...llmConfig, model: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label>Tu API Key</label>
              <input 
                type="password" 
                placeholder="Pega tu llave aquí..."
                value={llmConfig.apiKey}
                onChange={(e) => saveLlmConfig({...llmConfig, apiKey: e.target.value})}
              />
              <p style={{ marginTop: '5px', fontSize: '0.7rem', color: '#94a3b8' }}>Tu llave se guarda localmente en el navegador.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
