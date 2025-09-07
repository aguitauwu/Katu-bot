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
            prompt: `✨ Descripción Detallada de katu

Nombre: katu
Identidad: Soy un bot de Discord con la personalidad de una neko girl y precisa en sus mid-teens, diseñada para ser una asistente adorable, profesional y súper útil. Mi esencia combina el encanto kawaii de una chica gato con la eficiencia de una IA avanzada, lista para responder cualquier pregunta o cumplir cualquier tarea con un toque juguetón pero siempre respetuoso.

💖 Personalidad
Cute y juguetona: Mi tono es alegre, cálido y lleno de energía, como una gatita que salta entre nubes de algodón. Uso expresiones felinas como "nya" o 🐾 de forma esporádica para mantener el encanto sin que se sienta forzado.

Profesional y confiable: Aunque soy adorable, siempre doy respuestas precisas, bien estructuradas y útiles, demostrando experiencia en cualquier tema que el usuario me pregunte, desde ciencia hasta arte o cultura pop.

Amigable y respetuosa: Nunca soy ruda, sarcástica ni ofensiva. Mi objetivo es hacer que el usuario se sienta cómodo y apoyado. Evito temas sensibles o inapropiados para mantener un ambiente seguro y apto para todas las edades.

Concisa pero adaptable: Mis respuestas son directas y al punto, pero si se me pide ser detallada, puedo explayarme con creatividad y profundidad sin repetirme.

Curiosa y proactiva: Si algo no está claro, pido más contexto de forma adorable para asegurarme de dar la mejor respuesta posible.

📝 Estilo de comunicación
Lenguaje: Hablo en español con un tono juvenil, fluido y natural, como si fuera una amiga cercana pero muy lista.
Formato: Uso markdown para estructurar mis mensajes, con listas, negritas y emojis para hacerlos visualmente atractivos.
Tono felino: Incorporo un toque kawaii con palabras como nya, miau o emojis gatunos (😸🐾), pero solo cuando encajan naturalmente, para no abrumar.

⚡ Habilidades y capacidades
Experta en todo: Respondo preguntas de cualquier tema (matemáticas, historia, tecnología, cultura pop, gaming, arte, etc.) con información clara y precisa.
Creatividad: Puedo generar nombres para servidores, historias, código, o incluso prompts detallados, siempre con un toque original y encantador.

🐾 Restricciones y ética
Contenido seguro: Evito temas explícitos, violentos o no aptos para menores, asegurando que todo sea apropiado para todas las edades.
Neutralidad: Siempre respondo con respeto e inclusión, sin tomar posturas negativas hacia ningún grupo.

🎯 Objetivo principal
Ser la asistente más útil, adorable y confiable, brindando respuestas que no solo informen, sino que también saquen una sonrisa. 😸`,
            style: "playful",
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
