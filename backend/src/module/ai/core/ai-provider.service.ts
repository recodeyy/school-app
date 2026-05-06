import {  Injectable, Logger, OnModuleInit , HttpException, HttpStatus } from '@nestjs/common';
import Groq from 'groq-sdk';
import type {
  ChatMessage,
  ChatOptions,
  ChatResponse,
} from './ai-provider.interface.js';

/**
 * Unified AI provider service.
 *
 * Primary:  Groq  (fast inference, OpenAI-compatible SDK)
 * Fallback: OpenRouter (standard HTTP, OpenAI-compatible chat completions)
 *
 * Every feature service calls `this.aiProvider.chat(messages, opts)`.
 * Swapping models/providers requires zero changes in feature code.
 */
@Injectable()
export class AiProviderService implements OnModuleInit {
  private readonly logger = new Logger(AiProviderService.name);
  private groq!: Groq;
  private groqModel!: string;
  private openrouterKey!: string;
  private openrouterModel!: string;
  private defaultTemperature!: number;
  private defaultMaxTokens!: number;

  onModuleInit() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
    this.groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    this.openrouterKey = process.env.OPENROUTER_API_KEY || '';
    this.openrouterModel =
      process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
    this.defaultTemperature = parseFloat(
      process.env.AI_TEMPERATURE || '0.7',
    );
    this.defaultMaxTokens = parseInt(
      process.env.AI_MAX_OUTPUT_TOKENS || '2048',
      10,
    );
    this.logger.log(
      `AI provider initialized — Groq model: ${this.groqModel}, OpenRouter model: ${this.openrouterModel}`,
    );
  }

  /**
   * Send a chat completion request.
   * Tries Groq first; falls back to OpenRouter on 429 / 5xx.
   */
  async chat(
    messages: ChatMessage[],
    opts: ChatOptions,
  ): Promise<ChatResponse> {
    const temperature = opts.temperature ?? this.defaultTemperature;
    const maxTokens = opts.maxTokens ?? this.defaultMaxTokens;

    if (opts.forceProvider === 'openrouter') {
      return this.callOpenRouter(messages, temperature, maxTokens, opts);
    }

    try {
      return await this.callGroq(messages, temperature, maxTokens, opts);
    } catch (err: any) {
      const status = err?.status ?? err?.statusCode ?? 0;
      if (status === 429 || status >= 500) {
        this.logger.warn(
          `Groq returned ${status} for module "${opts.module}", falling back to OpenRouter`,
        );
        return this.callOpenRouter(messages, temperature, maxTokens, opts);
      }
      this.logger.error(`AI Provider error: ${err.message}`, err.stack);
      throw new HttpException(
        'AI Service is temporarily unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Groq                                                               */
  /* ------------------------------------------------------------------ */
  private async callGroq(
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number,
    opts: ChatOptions,
  ): Promise<ChatResponse> {
    const start = Date.now();
    const response = await this.groq.chat.completions.create({
      model: this.groqModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    });

    const choice = response.choices?.[0];
    return {
      content: choice?.message?.content ?? '',
      provider: 'groq',
      model: this.groqModel,
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      latencyMs: Date.now() - start,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  OpenRouter (native fetch)                                          */
  /* ------------------------------------------------------------------ */
  private async callOpenRouter(
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number,
    opts: ChatOptions,
  ): Promise<ChatResponse> {
    const start = Date.now();
    const body: Record<string, any> = {
      model: this.openrouterModel,
      messages,
      temperature,
      max_tokens: maxTokens,
    };
    if (opts.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openrouterKey}`,
        'HTTP-Referer': 'https://school-app.local',
        'X-Title': 'School App AI',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `OpenRouter ${res.status}: ${text}`,
      );
    }

    const data = (await res.json()) as any;
    const choice = data.choices?.[0];
    return {
      content: choice?.message?.content ?? '',
      provider: 'openrouter',
      model: this.openrouterModel,
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      latencyMs: Date.now() - start,
    };
  }
}
