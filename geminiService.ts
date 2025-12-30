
import { GoogleGenAI } from "@google/genai";

export async function getFinancialAdvisorInsights(dataSummary: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Como um consultor financeiro sênior especializado em pecuária de corte, analise os seguintes dados financeiros de uma fazenda e forneça insights estratégicos curtos (máximo 3 pontos).
    FOCO: Custos por animal, margem de lucro e eficiência alimentar.
    
    Dados:
    ${dataSummary}

    Responda em Português do Brasil com tom profissional e acionável.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao obter insights da IA:", error);
    return "Não foi possível gerar insights no momento.";
  }
}

export async function fetchLiveCattlePrice() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = "Qual é a cotação atualizada da arroba do boi gordo hoje no Brasil (valor médio CEPEA)? Forneça o valor numérico e a fonte.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    // Tenta extrair o valor numérico básico para exibição simples se o texto for complexo
    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Erro ao buscar cotação:", error);
    return { text: "R$ 232,50 (Valores simulados por erro de conexão)", sources: [] };
  }
}

export async function simulatePriceSensitivity(currentPrice: number, costPerAnimal: number) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Simule 3 cenários de mercado para o preço da arroba do boi gordo e como isso afeta o lucro líquido de um animal com custo de produção de R$ ${costPerAnimal.toFixed(2)}. 
    O preço atual de referência é R$ ${currentPrice.toFixed(2)} por arroba.
    Considere um animal médio de 18 arrobas.
    
    Responda em formato JSON:
    [
      { "scenario": "Pessimista", "price": 0, "profit": 0, "comment": "" },
      ...
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Erro na simulação:", error);
    return [];
  }
}
