/**
 * LLM client — supports multiple providers via env vars.
 *
 * Ported from Panya-AI (`src/lib/zai-client.ts`) and extended for
 * vision input (reference images / video frames) and JSON response formats.
 *
 * Provider selection (in priority order):
 * 1. OPENROUTER_API_KEY  → OpenRouter (recommended — excellent Thai, free tiers)
 * 2. XAI_API_KEY         → xAI Grok
 * 3. Z_AI_API_KEY        → Z.AI (GLM)
 *
 * OpenRouter: https://openrouter.ai — models commonly used:
 *   - inclusionai/ling-3.0-flash:free        (text, great Thai)
 *   - google/gemini-2.0-flash-exp:free       (vision — image input)
 *   - qwen/qwen2.5-vl-72b-instruct:free      (vision)
 *
 * xAI: https://api.x.ai — grok-4.5 (vision-capable)
 *
 * Z.AI: https://z.ai — glm-4.6, glm-4.5-flash
 */

export type ImagePart = { type: "image_url"; image_url: { url: string } };
export type TextPart = { type: "text"; text: string };
export type ContentPart = TextPart | ImagePart;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  /** OpenAI-style response_format, e.g. { type: "json_object" } */
  responseFormat?: Record<string, unknown>;
  /** True when the request carries images — selects a vision-capable model. */
  hasImages?: boolean;
}

export interface ChatCompletion {
  content: string;
  raw: unknown;
  provider: string;
  model: string;
}

export type ProviderId = "openrouter" | "xai" | "zai";

function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

/** Which provider will be used with the current env — first match wins. */
export function resolveProvider(): { id: ProviderId; model: string } | null {
  if (env("OPENROUTER_API_KEY")) {
    return {
      id: "openrouter",
      model: env("OPENROUTER_MODEL") || "inclusionai/ling-3.0-flash:free",
    };
  }
  if (env("XAI_API_KEY")) {
    return { id: "xai", model: env("XAI_MODEL") || "grok-4.5" };
  }
  if (env("Z_AI_API_KEY")) {
    return { id: "zai", model: env("Z_AI_MODEL") || "glm-4.6" };
  }
  return null;
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatCompletion> {
  const provider = resolveProvider();
  if (!provider) {
    throw new LlmMisconfigured(
      "No LLM API key configured. Set OPENROUTER_API_KEY, XAI_API_KEY or Z_AI_API_KEY.",
    );
  }

  if (provider.id === "openrouter") {
    return callOpenAICompatible({
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: env("OPENROUTER_API_KEY") as string,
      apiKeyHeader: "Authorization",
      messages,
      options,
      model: options.hasImages
        ? env("OPENROUTER_VISION_MODEL") ||
          env("OPENROUTER_MODEL") ||
          "google/gemini-2.0-flash-exp:free"
        : provider.model,
      extraHeaders: {
        "HTTP-Referer": env("APP_URL") || "https://promptreel.vercel.app",
        "X-Title": "PromptReel",
      },
    });
  }

  if (provider.id === "xai") {
    return callOpenAICompatible({
      name: "xai",
      url: "https://api.x.ai/v1/chat/completions",
      apiKey: env("XAI_API_KEY") as string,
      apiKeyHeader: "Authorization",
      messages,
      options,
      model: provider.model,
    });
  }

  return callOpenAICompatible({
    name: "zai",
    url: "https://api.z.ai/api/paas/v4/chat/completions",
    apiKey: env("Z_AI_API_KEY") as string,
    apiKeyHeader: "Authorization",
    messages,
    options,
    model: provider.model,
  });
}

// ---------- OpenAI-compatible caller (shared by all providers) ----------

interface CompatibleCallArgs {
  name: ProviderId;
  url: string;
  apiKey: string;
  apiKeyHeader: "Authorization" | "x-api-key";
  messages: ChatMessage[];
  options: ChatOptions;
  model: string;
  extraHeaders?: Record<string, string>;
}

async function callOpenAICompatible(args: CompatibleCallArgs): Promise<ChatCompletion> {
  const body: Record<string, unknown> = {
    model: args.model,
    messages: args.messages,
    temperature: args.options.temperature ?? 0.85,
    max_tokens: args.options.maxTokens ?? 8192,
    stream: false,
  };
  if (args.options.responseFormat) {
    body.response_format = args.options.responseFormat;
  }

  console.log(
    `[llm] ${args.name} model: ${args.model} · messages: ${args.messages.length} · images: ${args.options.hasImages ? "yes" : "no"}`,
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...args.extraHeaders,
  };
  if (args.apiKeyHeader === "Authorization") {
    headers.Authorization = `Bearer ${args.apiKey}`;
  } else {
    headers["x-api-key"] = args.apiKey;
  }

  let response: Response;
  try {
    response = await fetch(args.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new LlmNetwork(`เชื่อมต่อ ${args.name} ไม่สำเร็จ`);
  }

  const rawText = await response.text();
  if (!response.ok) {
    let detail = rawText.slice(0, 400);
    try {
      const errJson = JSON.parse(rawText) as {
        error?: { message?: string } | string;
        message?: string;
      };
      const msg =
        typeof errJson.error === "string"
          ? errJson.error
          : errJson.error?.message ?? errJson.message;
      if (msg) detail = msg;
    } catch {
      // keep raw text slice
    }
    throw new LlmHttpError(response.status, detail, args.name);
  }

  try {
    const json = JSON.parse(rawText) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    if (!content) {
      throw new LlmEmpty("AI ไม่ได้ส่งข้อความกลับมา");
    }
    return { content, raw: json, provider: args.name, model: args.model };
  } catch (err) {
    if (err instanceof LlmError) throw err;
    throw new LlmEmpty("อ่านผลลัพธ์จาก AI ไม่สำเร็จ");
  }
}

// ---------- Typed errors (map to friendly Thai messages at the route layer) ----------

export class LlmError extends Error {}
export class LlmMisconfigured extends LlmError {}
export class LlmNetwork extends LlmError {}
export class LlmEmpty extends LlmError {}
export class LlmHttpError extends LlmError {
  constructor(
    public status: number,
    public detail: string,
    public provider: string,
  ) {
    super(`${provider} HTTP ${status}: ${detail.slice(0, 120)}`);
  }
}
