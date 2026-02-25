-- Esquema inicial para LinkedIn Content Guru SaaS

-- Tabla de Usuarios/Perfiles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    linkedin_url TEXT UNIQUE,
    full_name TEXT,
    profile_summary TEXT, -- El texto 'Acerca de' o biografía
    identity_summary TEXT, -- La síntesis estratégica generada por IA
    voice_dna TEXT, -- El ADN de voz analizado
    questionnaire_data JSONB, -- Respuesta a metas/retos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Publicaciones Generadas
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    topic TEXT,
    content TEXT,
    structure_name TEXT,
    strategy_used TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE, -- Cuándo debe publicarse
    published_at TIMESTAMP WITH TIME ZONE, -- Cuándo se publicó realmente
    status TEXT DEFAULT 'draft', -- draft, scheduled, published, failed
    linkedin_post_id TEXT, -- ID retornado por LinkedIn
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Tokens de LinkedIn (OAuth2)
CREATE TABLE IF NOT EXISTS linkedin_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    access_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_token TEXT,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
