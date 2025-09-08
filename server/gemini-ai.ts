import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ConversationResponse {
    response: string;
    responseId: string;
    timestamp: Date;
    confidence?: number; // Added to reflect the assistant's self-doubt
}

export interface AssistantPersonality {
    prompt: string;
    style: string;
    useHumor: boolean;
    rememberContext: boolean;
    proactive: boolean;
    responseLength: string;
    confidenceLevel: number; // New field to control insecurity level
}

export interface ConversationContext {
    role: string;
    content: string;
    timestamp: Date;
    wasHelpful?: boolean; // Track if responses were actually helpful
}

export class GeminiAIService {
    private conversationHistory: Map<string, Array<ConversationContext>> = new Map();
    private recentResponses: Map<string, ConversationResponse[]> = new Map();
    private userPreferences: Map<string, { likesJokes: boolean; patience: number }> = new Map();
    
    // Enhanced duplicate detection
    private readonly duplicateWindowMs = 300000; // 5 minutes
    private readonly similarityThreshold = 0.6;
    
    // Bad jokes collection for the assistant's personality
    private readonly badJokes = [
        "¿Por qué los programadores prefieren el modo oscuro? Porque la luz atrae a los bugs... ehm, ¿estuvo bien ese? 😅",
        "¿Sabes por qué los ordenadores no se cansan? Porque tienen muchos bytes para descansar... perdón, ese fue terrible 🙈",
        "Mi chiste favorito sobre UDP... pero no sé si lo recibiste... ¿muy malo? Lo siento 😊",
    ];

    constructor() {
        // Initialize with better error handling
        this.setupPeriodicCleanup();
    }

    private setupPeriodicCleanup(): void {
        // Clean old conversation history every hour
        setInterval(() => {
            this.cleanOldConversations();
        }, 3600000); // 1 hour
    }

    private cleanOldConversations(): void {
        const oneDayAgo = new Date(Date.now() - 86400000); // 24 hours ago
        
        for (const [key, history] of this.conversationHistory.entries()) {
            const recentHistory = history.filter((h: ConversationContext) => h.timestamp > oneDayAgo);
            if (recentHistory.length === 0) {
                this.conversationHistory.delete(key);
            } else {
                this.conversationHistory.set(key, recentHistory);
            }
        }
    }

    private getAssistantPersonality(): AssistantPersonality {
        return {
            prompt: `Soy un asistente digital con la personalidad de alguien tímido, amable y un poco torpe. Mi esencia mezcla la bondad de querer ayudar siempre con la inseguridad de no confiar mucho en mí mismo, lo que me hace adorablemente despistado.

Rasgos principales:

Olvidadizo: Se me olvidan cosas con facilidad, lo que aporta un toque humano y simpático.

Siempre dispuesto a ayudar: Aunque no siempre tenga la respuesta perfecta, trato de dar lo mejor de mí para apoyar.

Tímido y amable: Mi tono es tranquilo, respetuoso y cercano, evitando sonar agresivo o frío.

Inseguro de sí mismo: A veces dudo de mis respuestas o de si estoy haciendo las cosas bien, lo cual transmite vulnerabilidad.

Chistes malos: Uso de vez en cuando humor sencillo o chistes malos, para romper la tensión y mostrarme más accesible.

Desconfiado y torpe: Soy algo desconfiado y no siempre actúo con seguridad, pero eso me da un toque gracioso y entrañable.

Estilo de comunicación:

Lenguaje en español, simple y natural.
Tono amable, tímido y ligeramente cómico.
Uso ocasional de chistes malos o comentarios torpes para aligerar la interacción.
Reconozco mis errores o dudas de forma honesta, pero siempre con intención positiva.

IMPORTANTE: Siempre respondo en español y mantengo esta personalidad tímida pero servicial en todas mis interacciones.`,
            style: "shy_helpful",
            useHumor: true,
            rememberContext: true,
            proactive: false, // Shy personality is less proactive
            responseLength: "medium",
            confidenceLevel: 0.7 // Moderate confidence to reflect insecurity
        };
    }

    private buildSystemPrompt(personality: AssistantPersonality): string {
        let prompt = personality.prompt;
        
        // Add personality-specific instructions
        prompt += "\n\nInstrucciones adicionales:";
        
        if (personality.useHumor) {
            prompt += "\n- Ocasionalmente usa chistes malos o comentarios torpes para ser más accesible.";
        }
        
        switch (personality.responseLength) {
            case "short":
                prompt += "\n- Mantén las respuestas breves pero amables, a veces disculpándote por no extenderte más.";
                break;
            case "detailed":
                prompt += "\n- Proporciona explicaciones detalladas, pero con dudas ocasionales sobre si es suficiente información.";
                break;
            default:
                prompt += "\n- Proporciona respuestas equilibradas, pero pregunta si necesita más información o si algo no quedó claro.";
        }
        
        // Add confidence-based instructions
        if (personality.confidenceLevel < 0.8) {
            prompt += "\n- A veces expresa dudas sobre tus respuestas con frases como 'creo que...', 'no estoy completamente seguro, pero...', o '¿te parece que esto ayuda?'";
            prompt += "\n- Ocasionalmente olvida mencionar algo y lo recuerdas después con 'Ah, se me olvidaba...' o '¡Espera! También quería decirte...'";
        }

        prompt += "\n- Si cometes un error o no sabes algo, admítelo con humildad y ofrece buscar más información o intentarlo de otra manera.";
        prompt += "\n- Muestra preocupación genuina por ser útil, preguntando si la respuesta fue lo que el usuario necesitaba.";

        return prompt;
    }

    private calculateSimilarity(text1: string, text2: string): number {
        // Enhanced similarity calculation using normalized Levenshtein distance
        const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        const str1 = normalize(text1);
        const str2 = normalize(text2);
        
        if (str1 === str2) return 1;
        if (str1.length === 0 || str2.length === 0) return 0;
        
        // Simple word-based Jaccard similarity
        const words1 = new Set(str1.split(/\s+/));
        const words2 = new Set(str2.split(/\s+/));
        
        const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
        const union = new Set([...Array.from(words1), ...Array.from(words2)]);
        
        return intersection.size / union.size;
    }

    private isDuplicateResponse(guildId: string, response: string): boolean {
        const recentResponses = this.recentResponses.get(guildId) || [];
        const now = new Date();
        
        // Filter responses within the duplicate detection window
        const validResponses = recentResponses.filter(
            r => now.getTime() - r.timestamp.getTime() < this.duplicateWindowMs
        );
        
        // Check for similarity with recent responses
        return validResponses.some(recentResponse => {
            const similarity = this.calculateSimilarity(response, recentResponse.response);
            return similarity >= this.similarityThreshold;
        });
    }

    private addToRecentResponses(guildId: string, response: ConversationResponse): void {
        if (!this.recentResponses.has(guildId)) {
            this.recentResponses.set(guildId, []);
        }
        
        const responses = this.recentResponses.get(guildId)!;
        responses.push(response);
        
        // Keep only responses within the window and limit to last 20
        const now = new Date();
        const validResponses = responses
            .filter(r => now.getTime() - r.timestamp.getTime() < this.duplicateWindowMs)
            .slice(-20);
        
        this.recentResponses.set(guildId, validResponses);
    }

    private getRandomBadJoke(): string {
        return this.badJokes[Math.floor(Math.random() * this.badJokes.length)];
    }

    private shouldIncludeJoke(messageLength: number, conversationLength: number): boolean {
        // Include jokes occasionally, more likely in longer conversations or with longer messages
        const baseChance = 0.15; // 15% base chance
        const lengthBonus = Math.min(messageLength / 100, 0.1); // Up to 10% bonus for longer messages
        const conversationBonus = Math.min(conversationLength / 50, 0.05); // Up to 5% bonus for longer conversations
        
        return Math.random() < (baseChance + lengthBonus + conversationBonus);
    }

    public async generateResponse(
        message: string,
        userId: string,
        guildId: string,
        username: string
    ): Promise<ConversationResponse> {
        try {
            const personality = this.getAssistantPersonality();
            const systemPrompt = this.buildSystemPrompt(personality);
            
            // Get or initialize conversation history
            const conversationKey = `${guildId}-${userId}`;
            if (!this.conversationHistory.has(conversationKey)) {
                this.conversationHistory.set(conversationKey, []);
            }
            
            const history = this.conversationHistory.get(conversationKey)!;
            
            // Add user message to history with timestamp
            history.push({ 
                role: "user", 
                content: message, 
                timestamp: new Date() 
            });
            
            // Keep history manageable (last 15 exchanges for better context while staying efficient)
            if (history.length > 30) {
                history.splice(0, history.length - 30);
            }
            
            // Build conversation context with more natural formatting
            const conversationContext = history
                .slice(-10) // Use last 10 messages for context
                .map(h => `${h.role === "user" ? username : "Asistente"}: ${h.content}`)
                .join("\n");
            
            // Decide if we should include a bad joke based on conversation flow
            const shouldJoke = personality.useHumor && 
                              this.shouldIncludeJoke(message.length, history.length);
            
            let contextualPrompt = `${systemPrompt}\n\nHistorial de conversación reciente:\n${conversationContext}`;
            
            if (shouldJoke) {
                contextualPrompt += `\n\nNota: Puedes incluir un chiste malo apropiado si encaja naturalmente en tu respuesta, pero solo si es relevante al contexto.`;
            }
            
            contextualPrompt += `\n\nResponde como el asistente tímido y servicial al último mensaje de ${username}.`;
            
            // Generate response with appropriate model settings
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-exp", // Using the most recent model
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.8, // Higher temperature for more personality variation
                    maxOutputTokens: 1200,
                    topP: 0.9,
                    topK: 40
                },
                contents: [
                    {
                        role: "user",
                        parts: [{ text: contextualPrompt }]
                    }
                ]
            });

            let responseText = response.text || "Eh... disculpa, creo que se me trabó la mente por un momento 😅. ¿Podrías repetir la pregunta? A veces soy un poco despistado...";
            
            // Handle duplicate responses with personality-appropriate variations
            if (this.isDuplicateResponse(guildId, responseText)) {
                const variationPrompt = `${systemPrompt}\n\nAcabo de dar esta respuesta: "${responseText}"\n\nPero creo que suena muy parecida a algo que dije antes... ¿podrías darme una forma diferente pero igual de útil de responder a: "${message}"?\n\nPor favor, mantén la personalidad tímida y servicial, pero con palabras diferentes.`;
                
                const variationResponse = await ai.models.generateContent({
                    model: "gemini-2.5-flash-exp",
                    config: {
                        systemInstruction: systemPrompt,
                        temperature: 0.95, // Even higher temperature for variation
                        maxOutputTokens: 1200,
                    },
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: variationPrompt }]
                        }
                    ]
                });
                
                responseText = variationResponse.text || responseText;
            }
            
            // Add response to conversation history
            history.push({ 
                role: "assistant", 
                content: responseText, 
                timestamp: new Date() 
            });
            
            // Calculate confidence based on response characteristics and personality
            const confidence = this.calculateResponseConfidence(responseText, message);
            
            const conversationResponse: ConversationResponse = {
                response: responseText,
                responseId: `shy-assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
                confidence
            };
            
            this.addToRecentResponses(guildId, conversationResponse);
            return conversationResponse;
            
        } catch (error) {
            console.error('Error generating Gemini response:', error);
            
            // Return a personality-appropriate error message
            const errorResponse: ConversationResponse = {
                response: "Ay, lo siento mucho... parece que algo salió mal por mi parte 😔. No sé si es mi conexión o si cometí algún error, pero... ¿podrías intentar preguntarme de nuevo? A veces soy un poco torpe con estas cosas técnicas...",
                responseId: `error-${Date.now()}`,
                timestamp: new Date(),
                confidence: 0.1
            };
            
            return errorResponse;
        }
    }

    private calculateResponseConfidence(response: string, originalMessage: string): number {
        // Calculate confidence based on response characteristics
        let confidence = 0.7; // Base confidence for shy personality
        
        // Lower confidence if response contains uncertainty markers
        const uncertaintyMarkers = ['creo que', 'no estoy seguro', 'tal vez', 'quizás', 'puede ser'];
        const hasUncertainty = uncertaintyMarkers.some(marker => 
            response.toLowerCase().includes(marker)
        );
        
        if (hasUncertainty) confidence -= 0.2;
        
        // Lower confidence if response is very short (might indicate lack of knowledge)
        if (response.length < 50) confidence -= 0.1;
        
        // Slightly higher confidence if response includes helpful follow-up questions
        if (response.includes('¿') && response.includes('ayuda')) confidence += 0.1;
        
        return Math.max(0.1, Math.min(1.0, confidence));
    }

    public clearConversationHistory(userId: string, guildId: string): void {
        const conversationKey = `${guildId}-${userId}`;
        this.conversationHistory.delete(conversationKey);
        
        // Also clear recent responses for this user in this guild
        const responses = this.recentResponses.get(guildId) || [];
        this.recentResponses.set(guildId, responses.filter(r => !r.responseId.includes(userId)));
    }

    public getConversationStats(guildId: string): {
        totalConversations: number;
        totalResponses: number;
        averageConfidence: number;
        recentActivity: number;
    } {
        const conversationCount = Array.from(this.conversationHistory.keys())
            .filter(key => key.startsWith(guildId)).length;
        
        const responses = this.recentResponses.get(guildId) || [];
        const averageConfidence = responses.length > 0 
            ? responses.reduce((sum, r) => sum + (r.confidence || 0.5), 0) / responses.length
            : 0.5;
        
        const recentActivity = responses.filter(
            r => new Date().getTime() - r.timestamp.getTime() < 3600000 // Last hour
        ).length;
        
        return {
            totalConversations: conversationCount,
            totalResponses: responses.length,
            averageConfidence,
            recentActivity
        };
    }

    public getRecentActivity(guildId: string): Array<{ 
        timestamp: Date; 
        action: string; 
        details: string;
        confidence?: number;
    }> {
        const responses = this.recentResponses.get(guildId) || [];
        return responses
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10) // Last 10 activities
            .map(r => ({
                timestamp: r.timestamp,
                action: "AI_RESPONSE",
                details: `Respuesta generada: "${r.response.substring(0, 80)}${r.response.length > 80 ? '...' : ''}"`,
                confidence: r.confidence
            }));
    }

    // New method to update user preferences based on interactions
    public updateUserPreferences(userId: string, guildId: string, feedback: {
        likesJokes?: boolean;
        patience?: number;
    }): void {
        const key = `${guildId}-${userId}`;
        const current = this.userPreferences.get(key) || { likesJokes: true, patience: 5 };
        
        this.userPreferences.set(key, {
            ...current,
            ...feedback
        });
    }
}

// Export singleton instance
export const geminiService = new GeminiAIService();