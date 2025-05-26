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
    Analyze the following product sales data and provide insights:
    
    Products: ${JSON.stringify(products)}
    
    Please provide a JSON response with the following structure:
    {
      "topPerformers": [list of top 5 performing products with reasons],
      "underPerformers": [list of bottom 5 performing products with reasons],
      "insights": [3-5 key insights about sales patterns],
      "recommendations": [3-5 actionable recommendations for improving sales]
    }
    `;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a retail analytics expert. Analyze product performance data and provide actionable insights in JSON format."
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
    Analyze these low stock items and provide restock recommendations:
    
    Low Stock Items: ${JSON.stringify(lowStockItems)}
    
    Please provide a JSON response with the following structure:
    {
      "urgentItems": [items that need immediate restocking],
      "mediumPriority": [items that need restocking soon],
      "recommendations": [specific recommendations for each category],
      "totalEstimatedCost": [estimated total cost for restocking all items]
    }
    `;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are an inventory management expert. Analyze low stock data and provide prioritized restock recommendations in JSON format."
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
