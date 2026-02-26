import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export async function callLLM({ provider, model, apiKey, prompt, systemPrompt = "" }) {
  console.log(`Llamando a LLM: ${provider} - ${model}`);
  
  try {
    switch (provider) {
      case 'google':
        const genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY);
        const googleModel = genAI.getGenerativeModel({ model: model || "gemini-2.5-flash" });
        const googleResult = await googleModel.generateContent(
          systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
        );
        return googleResult.response.text();

      case 'openai':
      case 'deepseek':
      case 'mistral':
      case 'qwen':
      case 'custom-openai':
        const openaiConfig = {
          apiKey: apiKey || (
            provider === 'openai' ? process.env.OPENAI_API_KEY : 
            provider === 'deepseek' ? process.env.DEEPSEEK_API_KEY :
            provider === 'mistral' ? process.env.MISTRAL_API_KEY :
            provider === 'qwen' ? process.env.QWEN_API_KEY :
            process.env.CUSTOM_OPENAI_API_KEY
          ),
        };
        
        if (provider === 'deepseek') {
          openaiConfig.baseURL = "https://api.deepseek.com";
        } else if (provider === 'mistral') {
          openaiConfig.baseURL = "https://api.mistral.ai/v1";
        } else if (provider === 'qwen') {
          openaiConfig.baseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
        } else if (provider === 'custom-openai') {
          // Para otros proveedores chinos o locales compatibles con OpenAI
          openaiConfig.baseURL = process.env.CUSTOM_OPENAI_BASE_URL;
        }

        const openai = new OpenAI(openaiConfig);
        const openaiResponse = await openai.chat.completions.create({
          model: model || (provider === 'openai' ? "gpt-4o-mini" : "deepseek-chat"),
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
        });
        return openaiResponse.choices[0].message.content;

      case 'anthropic':
        const anthropic = new Anthropic({
          apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
        });
        const anthropicResponse = await anthropic.messages.create({
          model: model || "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            { role: "user", content: prompt }
          ],
        });
        return anthropicResponse.content[0].text;

      default:
        throw new Error(`Proveedor no soportado: ${provider}`);
    }
  } catch (error) {
    console.error(`Error en callLLM (${provider}):`, error);
    throw error;
  }
}
