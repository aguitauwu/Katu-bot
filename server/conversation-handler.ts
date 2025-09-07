import { Message } from 'discord.js';
import { geminiService } from './gemini-ai.js';
import { Logger } from './logger.js';

export class ConversationHandler {
    private respondingUsers: Set<string> = new Set();
    
    public async shouldRespond(message: Message): Promise<boolean> {
        // Don't respond to bots
        if (message.author.bot) return false;
        
        // Don't respond in DMs for now
        if (!message.guild) return false;
        
        // Respond if bot is mentioned
        if (message.mentions.has(message.client.user!)) return true;
        
        // Respond if message starts with "katu" (case insensitive)
        if (message.content.toLowerCase().startsWith('katu')) return true;
        
        // Respond to direct questions (contains question marks and is addressed generally)
        if (message.content.includes('?') && message.content.length > 10) {
            // Random chance to respond to questions (10%)
            return Math.random() < 0.1;
        }
        
        return false;
    }
    
    public async handleConversation(message: Message): Promise<void> {
        const userId = message.author.id;
        const guildId = message.guild?.id;
        const username = message.author.username;
        
        if (!guildId) {
            Logger.warn('ConversationHandler', 'No guild ID found for message');
            return;
        }
        
        // Prevent multiple responses to the same user
        const userKey = `${guildId}-${userId}`;
        if (this.respondingUsers.has(userKey)) {
            Logger.warn('ConversationHandler', `Already responding to ${username} in ${message.guild!.name}`);
            return;
        }
        
        this.respondingUsers.add(userKey);
        
        try {
            // Show typing indicator
            if ('sendTyping' in message.channel) {
                await message.channel.sendTyping();
            }
            
            // Clean message content (remove mentions, etc.)
            let cleanContent = message.content
                .replace(/<@!?\d+>/g, '') // Remove user mentions
                .replace(/^katu\s*/i, '') // Remove "katu" prefix
                .trim();
            
            if (!cleanContent) {
                cleanContent = "Hello! How can I help you today?";
            }
            
            Logger.info('ConversationHandler', `Processing message from ${username}: "${cleanContent}"`);
            
            // Generate AI response
            const aiResponse = await geminiService.generateResponse(
                cleanContent,
                userId,
                guildId,
                username
            );
            
            // Split long messages if needed
            const maxLength = 2000;
            if (aiResponse.response.length <= maxLength) {
                await message.reply(aiResponse.response);
            } else {
                // Split into chunks
                const chunks = this.splitMessage(aiResponse.response, maxLength);
                for (let i = 0; i < chunks.length; i++) {
                    if (i === 0) {
                        await message.reply(chunks[i]);
                    } else {
                        if ('send' in message.channel) {
                            await message.channel.send(chunks[i]);
                        }
                    }
                    
                    // Add small delay between chunks
                    if (i < chunks.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            
            Logger.success('ConversationHandler', `Responded to ${username} in ${message.guild!.name}`);
            
        } catch (error) {
            Logger.error('ConversationHandler', `Error responding to ${username}`, error);
            
            try {
                await message.reply("Meow! I'm having a bit of trouble right now. Can you try again in a moment? 🐱");
            } catch (replyError) {
                Logger.error('ConversationHandler', 'Failed to send error message', replyError);
            }
        } finally {
            // Remove from responding users after a delay to prevent rapid-fire responses
            setTimeout(() => {
                this.respondingUsers.delete(userKey);
            }, 2000);
        }
    }
    
    private splitMessage(message: string, maxLength: number): string[] {
        if (message.length <= maxLength) {
            return [message];
        }
        
        const chunks: string[] = [];
        let currentChunk = '';
        
        // Split by sentences first
        const sentences = message.split(/[.!?]\s+/);
        
        for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= maxLength - 2) {
                currentChunk += sentence + '. ';
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
                
                // If single sentence is too long, split by words
                if (sentence.length > maxLength) {
                    const words = sentence.split(' ');
                    let wordChunk = '';
                    
                    for (const word of words) {
                        if ((wordChunk + word).length <= maxLength - 1) {
                            wordChunk += word + ' ';
                        } else {
                            if (wordChunk) {
                                chunks.push(wordChunk.trim());
                                wordChunk = '';
                            }
                            
                            // If single word is too long, just add it
                            if (word.length > maxLength) {
                                chunks.push(word);
                            } else {
                                wordChunk = word + ' ';
                            }
                        }
                    }
                    
                    if (wordChunk) {
                        currentChunk = wordChunk;
                    }
                } else {
                    currentChunk = sentence + '. ';
                }
            }
        }
        
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }
}

export const conversationHandler = new ConversationHandler();
