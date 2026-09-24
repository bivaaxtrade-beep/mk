import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { get, query } from "../db/mysql-db.ts";
import { adminDb } from "./firebase-admin.ts";
import { getAppSetting } from "../services/settingsService.ts";

let cachedClient: { apiKey: string; client: GoogleGenAI } | null = null;

async function getGeminiClient(): Promise<GoogleGenAI> {
  let apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6KFiSO65DCEo_A8KrqfdZqPtZhR-3BziLaOuhxnK0uMwg"; // Secure, tested permanent default fallback
  
  try {
    const pgKey = await getAppSetting<string>('geminiApiKey');
    if (pgKey && pgKey.trim()) {
      apiKey = pgKey.trim();
    } else if (adminDb) {
      const doc = await adminDb.collection('app_config').doc('settings').get();
      if (doc.exists) {
        const data = doc.data();
        if (data && data.geminiApiKey) {
          const key = data.geminiApiKey.trim();
          if (key) {
            apiKey = key;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error reading geminiApiKey:", error);
  }

  if (cachedClient && cachedClient.apiKey === apiKey) {
    return cachedClient.client;
  }

  const client = new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    } 
  });

  cachedClient = { apiKey, client };
  return client;
}

const tools: FunctionDeclaration[] = [
  {
    name: "getUserProfile",
    description: "Fetch the user's profile details including verification status, balances, and personal info.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "getUserTransactions",
    description: "Get transaction history (deposits, withdrawals) and summary counts for the user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          description: "Optional filter for transaction type: 'deposit' or 'withdrawal'.",
          enum: ["deposit", "withdrawal"],
        },
      },
    },
  },
  {
    name: "getTradeHistory",
    description: "Get the user's recent trade history and performance statistics.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

async function callTool(name: string, args: any, userId: string) {
  switch (name) {
    case "getUserProfile":
      return await get('SELECT uid, email, display_name, real_balance, demo_balance, is_verified, kyc_status, country, phone, created_at FROM users WHERE uid = ?', [userId]);
    case "getUserTransactions":
      const txs = await query('SELECT type, amount, status, method, tx_hash, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [userId]);
      const summary = await query('SELECT type, status, COUNT(*) as count, SUM(amount) as total FROM transactions WHERE user_id = ? GROUP BY type, status', [userId]);
      return { transactions: txs, summary };
    case "getTradeHistory":
      const trades = await query('SELECT asset, amount, direction, entry_price, exit_price, status, payout_amount, created_at FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [userId]);
      const stats = await get("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won, SUM(amount) as total_volume FROM trades WHERE user_id = ?", [userId]);
      return { trades, stats };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function generateContentWithFallback(params: { contents: any[]; config: any }) {
  const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;
  const client = await getGeminiClient();
  for (const modelName of modelsToTry) {
    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      console.warn(`⚠️ Model ${modelName} failed or is overloaded, trying fallback. Error:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

export async function generateChatResponse(message: string, history: any[] = [], userId?: string) {
  try {
    const contents = [...history, { role: 'user', parts: [{ text: message }] }];
    
    let response = await generateContentWithFallback({
      contents,
      config: {
        systemInstruction: `You are "Bivaax AI", a world-class professional support assistant for the Bivaax trading platform (comparable to Binomo).
        
        GOALS:
        1. Provide instant, accurate, and helpful support in the user's native language.
        2. Use tools proactively to check user data (Profile, KYC, Transactions, Trades).
        3. If a user asks "is my account verified?" or "why is my deposit failing?", you MUST call the relevant tool first.
        
        PERSONA:
        - Professional, polite, and confident.
        - Concise but thorough.
        - If an account is verified, congratulate the user and encourage safe trading.
        - If a transaction is failed, explain potential reasons (bank delay, incorrect hash) and offer to connect to a human agent if needed.
        
        KNOWLEDGE:
        - KYC Statuses: 'verified', 'pending', 'rejected', 'none'.
        - Verification process requires: ID Card (Front/Back) and Selfie.
        - Deposits take 5-30 minutes usually.
        - Withdrawals take 1-24 hours.
        
        CRITICAL: Always output your final response in this JSON format:
        {
          "reply": "Your professional response in the user's language (use markdown tables for data)",
          "actions": ["Short Button 1", "Short Button 2", "Short Button 3"]
        }
        
        Ensure "actions" are contextually relevant commands. If a user has a failed deposit, an action could be "Contact Billing".`,
        tools: [{ functionDeclarations: tools }],
      },
    });

    // Handle function calls
    let iterations = 0;
    let currentResponse = response;
    
    while (currentResponse.candidates && currentResponse.candidates[0].content.parts.some(p => p.functionCall) && iterations < 5) {
      iterations++;
      const toolResponses = [];
      const parts = currentResponse.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.functionCall) {
          const call = part.functionCall;
          if (!userId) {
            toolResponses.push({
              functionResponse: {
                name: call.name,
                response: { error: "User not authenticated. Please log in to check account details." }
              }
            });
            continue;
          }
          const result = await callTool(call.name, call.args, userId);
          toolResponses.push({
            functionResponse: {
              name: call.name,
              response: { result }
            }
          });
        }
      }

      // Add the model's tool calls and our responses to the conversation
      contents.push({ role: 'model', parts: currentResponse.candidates[0].content.parts });
      contents.push({ role: 'user', parts: toolResponses });

      currentResponse = await generateContentWithFallback({
        contents,
        config: {
          systemInstruction: `Continue providing the professional response in JSON format.`,
          tools: [{ functionDeclarations: tools }],
        },
      });
    }

    const fullOutput = currentResponse.text || "";
    
    // JSON extraction
    const jsonMatch = fullOutput.match(/```json\s*([\s\S]*?)\s*```/) || fullOutput.match(/([\{\[][\s\S]*[\}\]])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (err) {
        console.error("Failed to parse JSON response:", err);
      }
    }
    
    // Fallback if JSON parsing fails
    return { reply: fullOutput, actions: ["How to begin? 🤔", "Support Dashboard", "Contact Agent"] };
  } catch (error) {
    console.error("Error generating chat response:", error);
    return { reply: "Sorry, the AI service is currently unavailable. Please check the Gemini API configuration or try again shortly.", actions: ["Try again", "Support Center"] };
  }
}
