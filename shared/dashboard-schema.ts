import { z } from "zod";

export const botConfigSchema = z.object({
  prefix: z.string().min(1).max(5),
  enabled: z.boolean(),
  responseTimeout: z.number().min(5).max(120),
});

export const geminiConfigSchema = z.object({
  model: z.enum(["gemini-2.5-flash", "gemini-2.5-pro"]),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(100).max(4000),
});

export const personalityConfigSchema = z.object({
  prompt: z.string().min(10),
  style: z.enum(["friendly", "professional", "playful", "witty"]),
  useEmojis: z.boolean(),
  rememberContext: z.boolean(),
  proactive: z.boolean(),
  responseLength: z.enum(["short", "medium", "detailed"]),
});

export const duplicatePreventionSchema = z.object({
  enabled: z.boolean(),
  windowMinutes: z.number().min(1).max(60),
  threshold: z.number().min(50).max(100),
});

export const dashboardConfigSchema = z.object({
  bot: botConfigSchema,
  gemini: geminiConfigSchema,
  personality: personalityConfigSchema,
  duplicatePrevention: duplicatePreventionSchema,
});

export type BotConfig = z.infer<typeof botConfigSchema>;
export type GeminiConfig = z.infer<typeof geminiConfigSchema>;
export type PersonalityConfig = z.infer<typeof personalityConfigSchema>;
export type DuplicatePreventionConfig = z.infer<typeof duplicatePreventionSchema>;
export type DashboardConfig = z.infer<typeof dashboardConfigSchema>;

export interface ActivityLogEntry {
  timestamp: Date;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR" | "AI" | "DUPLICATE";
  message: string;
}

export interface BotStats {
  duplicatesBlocked: number;
  successRate: number;
  totalResponses: number;
  uptime: string;
}
