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
    Sebagai ahli analisis ritel Indonesia, analisis data produk berikut dan berikan wawasan komprehensif:
    
    Data Produk: ${JSON.stringify(products)}
    
    Berikan respons dalam format JSON dengan struktur berikut (pastikan SEMUA teks dalam bahasa Indonesia yang natural dan mudah dipahami):
    {
      "topPerformers": [
        {
          "productName": "nama produk",
          "reason": "alasan kenapa produk ini berkinerja baik dalam 1-2 kalimat bahasa Indonesia"
        }
      ],
      "underPerformers": [
        {
          "productName": "nama produk", 
          "reason": "alasan kenapa produk ini kurang laku dalam 1-2 kalimat bahasa Indonesia"
        }
      ],
      "insights": [
        "Wawasan 1: analisis pola penjualan dalam bahasa Indonesia yang mudah dipahami",
        "Wawasan 2: tren produk yang terlihat dari data",
        "Wawasan 3: kesempatan yang bisa dimanfaatkan"
      ],
      "recommendations": [
        "Rekomendasi 1: saran spesifik untuk meningkatkan penjualan",
        "Rekomendasi 2: strategi yang bisa diterapkan segera",
        "Rekomendasi 3: langkah jangka panjang untuk pertumbuhan"
      ]
    }
    
    Pastikan semua teks menggunakan bahasa Indonesia yang natural dan sesuai konteks bisnis ritel di Indonesia.
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
    Sebagai ahli manajemen inventori Indonesia, analisis item stok rendah berikut dan berikan rekomendasi restock yang komprehensif:
    
    Data Stok Rendah: ${JSON.stringify(lowStockItems)}
    
    Berikan respons dalam format JSON dengan struktur berikut (pastikan SEMUA teks dalam bahasa Indonesia yang natural):
    {
      "urgentItems": [
        {
          "productName": "nama produk",
          "currentStock": "jumlah stok saat ini",
          "reason": "alasan kenapa perlu restock segera dalam bahasa Indonesia"
        }
      ],
      "mediumPriority": [
        {
          "productName": "nama produk",
          "currentStock": "jumlah stok saat ini", 
          "reason": "alasan kenapa bisa ditunda sedikit dalam bahasa Indonesia"
        }
      ],
      "recommendations": [
        "Saran 1: rekomendasi spesifik untuk manajemen stok yang efektif",
        "Saran 2: strategi pengadaan yang optimal untuk bisnis",
        "Saran 3: cara mencegah kehabisan stok di masa depan"
      ],
      "totalEstimatedCost": "estimasi biaya total dalam rupiah untuk restock semua item"
    }
    
    Pastikan semua analisis relevan dengan kondisi bisnis ritel di Indonesia dan menggunakan bahasa yang mudah dipahami.
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
