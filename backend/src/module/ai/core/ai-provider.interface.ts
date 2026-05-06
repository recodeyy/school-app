/**
 * Shared types for the AI provider abstraction layer.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  /** Which AI module is making the request (for logging / credit tracking). */
  module: string;
  /** Override the default temperature. */
  temperature?: number;
  /** Override the default max output tokens. */
  maxTokens?: number;
  /** Force a specific provider ('groq' | 'openrouter'). */
  forceProvider?: 'groq' | 'openrouter';
  /** When true, parse the AI response as JSON. */
  jsonMode?: boolean;
}

export interface ChatResponse {
  content: string;
  provider: 'groq' | 'openrouter';
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
}
