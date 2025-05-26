import OpenAI from "openai";
import { storage } from "./storage";

async function getOpenAIClient() {
  const apiKeySetting = await storage.getSystemSetting('openaiApiKey');
  const apiKey = apiKeySetting?.value || process.env.OPENAI_API_KEY || "default_key";
  
  return new OpenAI({ 
    apiKey: apiKey
  });
}

async function getOpenAIModel() {
  const modelSetting = await storage.getSystemSetting('openaiModel');
  return modelSetting?.value || "gpt-4o"; // default to gpt-4o if no model is set
}

export async function analyzeProductPerformance(products: any[]): Promise<{
  topPerformers: any[];
  underPerformers: any[];
  insights: string[];
  recommendations: string[];
}> {
  try {
    const openai = await getOpenAIClient();
    const model = await getOpenAIModel();
    
    const prompt = `
    Analisis data penjualan produk berikut dan berikan wawasan:
    
    Products: ${JSON.stringify(products)}
    
    Mohon berikan respons JSON dengan struktur berikut:
    {
      "topPerformers": [daftar 5 produk berkinerja terbaik dengan alasan dalam bahasa Indonesia],
      "underPerformers": [daftar 5 produk berkinerja rendah dengan alasan dalam bahasa Indonesia],
      "insights": [3-5 wawasan utama tentang pola penjualan dalam bahasa Indonesia],
      "recommendations": [3-5 rekomendasi yang dapat ditindaklanjuti untuk meningkatkan penjualan dalam bahasa Indonesia]
    }
    `;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "Anda adalah ahli analisis ritel. Analisis data performa produk dan berikan wawasan yang dapat ditindaklanjuti dalam format JSON. Selalu berikan respons dalam bahasa Indonesia."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      topPerformers: analysis.topPerformers || [],
      underPerformers: analysis.underPerformers || [],
      insights: analysis.insights || [],
      recommendations: analysis.recommendations || []
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      topPerformers: [],
      underPerformers: [],
      insights: ["AI analysis unavailable at the moment"],
      recommendations: ["Please check your OpenAI API configuration"]
    };
  }
}

export async function generateRestockRecommendations(lowStockItems: any[]): Promise<{
  urgentItems: any[];
  mediumPriority: any[];
  recommendations: string[];
  totalEstimatedCost: number;
}> {
  try {
    const openai = await getOpenAIClient();
    const model = await getOpenAIModel();
    
    const prompt = `
    Analisis item stok rendah berikut dan berikan rekomendasi restock:
    
    Low Stock Items: ${JSON.stringify(lowStockItems)}
    
    Mohon berikan respons JSON dengan struktur berikut:
    {
      "urgentItems": [item yang perlu direstock segera],
      "mediumPriority": [item yang perlu direstock dalam waktu dekat],
      "recommendations": [rekomendasi spesifik untuk setiap kategori dalam bahasa Indonesia],
      "totalEstimatedCost": [estimasi total biaya untuk restock semua item]
    }
    `;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "Anda adalah ahli manajemen inventori. Analisis data stok rendah dan berikan rekomendasi restock yang diprioritaskan dalam format JSON. Selalu berikan respons dalam bahasa Indonesia."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const recommendations = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      urgentItems: recommendations.urgentItems || [],
      mediumPriority: recommendations.mediumPriority || [],
      recommendations: recommendations.recommendations || [],
      totalEstimatedCost: recommendations.totalEstimatedCost || 0
    };
  } catch (error) {
    console.error("AI Restock Analysis Error:", error);
    return {
      urgentItems: [],
      mediumPriority: [],
      recommendations: ["AI recommendations unavailable at the moment"],
      totalEstimatedCost: 0
    };
  }
}
