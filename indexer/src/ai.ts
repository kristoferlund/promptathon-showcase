import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type AIEnrichmentInput = {
  url: string;
  rawTitle: string;
  metaDescription: string | null;
  extractedText: string;
};

export type AIEnrichmentOutput = {
  title: string;
  description: string;
};

const SYSTEM_PROMPT = `You are a metadata generator for a showcase gallery index.
Given a webpage's URL, title, meta description, and text content, generate:
1. A concise, descriptive title (max 100 characters)
2. A clear description (max 500 characters)

Return ONLY valid JSON with this exact structure:
{
  "title": "...",
  "description": "..."
}`;

export class AIEnricher {
  private openaiClient?: OpenAI;
  private anthropicClient?: Anthropic;
  private provider: 'openai' | 'anthropic';

  constructor(config: { openaiKey?: string; anthropicKey?: string }) {
    if (config.openaiKey) {
      this.openaiClient = new OpenAI({ apiKey: config.openaiKey });
      this.provider = 'openai';
    } else if (config.anthropicKey) {
      this.anthropicClient = new Anthropic({ apiKey: config.anthropicKey });
      this.provider = 'anthropic';
    } else {
      throw new Error('Either OPENAI_API_KEY or ANTHROPIC_API_KEY must be provided');
    }
  }

  async enrich(input: AIEnrichmentInput): Promise<AIEnrichmentOutput> {
    const userPrompt = `URL: ${input.url}
Raw Title: ${input.rawTitle}
Meta Description: ${input.metaDescription || 'N/A'}
Page Content (truncated): ${input.extractedText.slice(0, 4000)}

Generate title and description:`;

    if (this.provider === 'openai') {
      return this.enrichWithOpenAI(userPrompt);
    } else {
      return this.enrichWithAnthropic(userPrompt);
    }
  }

  private async enrichWithOpenAI(userPrompt: string): Promise<AIEnrichmentOutput> {
    const completion = await this.openaiClient!.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    return this.parseResponse(content);
  }

  private async enrichWithAnthropic(userPrompt: string): Promise<AIEnrichmentOutput> {
    const message = await this.anthropicClient!.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return this.parseResponse(content.text);
  }

  private parseResponse(content: string): AIEnrichmentOutput {
    const parsed = JSON.parse(content) as AIEnrichmentOutput;

    if (!parsed.title || !parsed.description) {
      throw new Error('AI response missing required fields');
    }

    return {
      title: parsed.title.slice(0, 100),
      description: parsed.description.slice(0, 500),
    };
  }
}

