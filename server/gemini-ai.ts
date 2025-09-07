import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ConversationResponse {
    response: string;
    responseId: string;
    timestamp: Date;
}

export interface KatuPersonality {
    prompt: string;
    style: string;
    useEmojis: boolean;
    rememberContext: boolean;
    proactive: boolean;
    responseLength: string;
}

export class GeminiAIService {
    private conversationHistory: Map<string, Array<{ role: string; content: string }>> = new Map();
    private recentResponses: Map<string, ConversationResponse[]> = new Map();
    private readonly duplicateWindowMs = 5 * 60 * 1000; // 5 minutes
    private readonly similarityThreshold = 0.85;

    private getKatuPersonality(): KatuPersonality {
        return {
            prompt: "You are Katu, a friendly and helpful AI assistant with a playful personality. You love to help users with their questions while maintaining a warm and approachable tone. You're knowledgeable but not condescending, and you enjoy making conversations engaging and fun. You often use cat-related expressions and emojis when appropriate.",
            style: "friendly",
            useEmojis: true,
            rememberContext: true,
            proactive: false,
            responseLength: "medium"
        };
    }

    private buildSystemPrompt(personality: KatuPersonality): string {
        let prompt = personality.prompt;
        
        if (personality.useEmojis) {
            prompt += " You use appropriate emojis to make your responses more engaging and expressive.";
        }
        
        switch (personality.responseLength) {
            case "short":
                prompt += " Keep your responses concise and to the point.";
                break;
            case "detailed":
                prompt += " Provide detailed and thorough explanations when helpful.";
                break;
            default:
                prompt += " Provide balanced responses that are informative but not overwhelming.";
        }
        
        switch (personality.style) {
            case "professional":
                prompt += " Maintain a professional and helpful tone.";
                break;
            case "playful":
                prompt += " Be playful and energetic in your responses.";
                break;
            case "witty":
                prompt += " Use wit and humor appropriately in your responses.";
                break;
            default:
                prompt += " Be friendly and casual in your interactions.";
        }

        return prompt;
    }

    private calculateSimilarity(text1: string, text2: string): number {
        // Simple similarity calculation using Jaccard similarity
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    private isDuplicateResponse(guildId: string, response: string): boolean {
        const recentResponses = this.recentResponses.get(guildId) || [];
        const now = new Date();
        
        // Clean old responses outside the window
        const validResponses = recentResponses.filter(
            r => now.getTime() - r.timestamp.getTime() < this.duplicateWindowMs
        );
        
        // Check for similarity with recent responses
        for (const recentResponse of validResponses) {
            const similarity = this.calculateSimilarity(response, recentResponse.response);
            if (similarity >= this.similarityThreshold) {
                return true;
            }
        }
        
        return false;
    }

    private addToRecentResponses(guildId: string, response: ConversationResponse): void {
        if (!this.recentResponses.has(guildId)) {
            this.recentResponses.set(guildId, []);
        }
        
        const responses = this.recentResponses.get(guildId)!;
        responses.push(response);
        
        // Keep only responses within the window
        const now = new Date();
        const validResponses = responses.filter(
            r => now.getTime() - r.timestamp.getTime() < this.duplicateWindowMs
        );
        
        this.recentResponses.set(guildId, validResponses);
    }

    public async generateResponse(
        message: string,
        userId: string,
        guildId: string,
        username: string
    ): Promise<ConversationResponse> {
        try {
            const personality = this.getKatuPersonality();
            const systemPrompt = this.buildSystemPrompt(personality);
            
            // Get or initialize conversation history
            const conversationKey = `${guildId}-${userId}`;
            if (!this.conversationHistory.has(conversationKey)) {
                this.conversationHistory.set(conversationKey, []);
            }
            
            const history = this.conversationHistory.get(conversationKey)!;
            
            // Add user message to history
            history.push({ role: "user", content: message });
            
            // Keep history manageable (last 10 exchanges)
            if (history.length > 20) {
                history.splice(0, history.length - 20);
            }
            
            // Build conversation context
            const conversationContext = history.map(h => 
                `${h.role === "user" ? username : "Katu"}: ${h.content}`
            ).join("\n");
            
            const fullPrompt = `${systemPrompt}\n\nConversation context:\n${conversationContext}\n\nPlease respond as Katu to the latest message.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                },
                contents: [
                    {
                        role: "user",
                        parts: [{ text: fullPrompt }]
                    }
                ]
            });

            const responseText = response.text || "Meow! I'm having trouble thinking of a response right now. Can you try asking me something else? 🐱";
            
            // Check for duplicate response
            if (this.isDuplicateResponse(guildId, responseText)) {
                // Generate a variation to avoid duplicate
                const variationPrompt = `${systemPrompt}\n\nThe previous response was: "${responseText}"\n\nPlease provide a different but equally helpful response to: "${message}"`;
                
                const variationResponse = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    config: {
                        systemInstruction: systemPrompt,
                        temperature: 0.9, // Higher temperature for more variation
                        maxOutputTokens: 1000,
                    },
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: variationPrompt }]
                        }
                    ]
                });
                
                const finalResponse = variationResponse.text || responseText;
                
                // Add to conversation history
                history.push({ role: "assistant", content: finalResponse });
                
                const conversationResponse: ConversationResponse = {
                    response: finalResponse,
                    responseId: `katu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date()
                };
                
                this.addToRecentResponses(guildId, conversationResponse);
                return conversationResponse;
            }
            
            // Add response to conversation history
            history.push({ role: "assistant", content: responseText });
            
            const conversationResponse: ConversationResponse = {
                response: responseText,
                responseId: `katu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date()
            };
            
            this.addToRecentResponses(guildId, conversationResponse);
            return conversationResponse;
            
        } catch (error) {
            console.error('Error generating Gemini response:', error);
            throw new Error(`Failed to generate AI response: ${error}`);
        }
    }

    public clearConversationHistory(userId: string, guildId: string): void {
        const conversationKey = `${guildId}-${userId}`;
        this.conversationHistory.delete(conversationKey);
    }

    public getRecentActivity(guildId: string): Array<{ timestamp: Date; action: string; details: string }> {
        const responses = this.recentResponses.get(guildId) || [];
        return responses.map(r => ({
            timestamp: r.timestamp,
            action: "AI_RESPONSE",
            details: `Generated response: ${r.response.substring(0, 50)}...`
        }));
    }
}

export const geminiService = new GeminiAIService();
