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
 * OpenRouter free models rotate frequently — when a model disappears
 * ("No endpoints found"), the client walks a fallback list automatically.
 * Check https://openrouter.ai/models?max_price=0 for the current catalog.
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

// OpenRouter free-tier fallback lists — verified against the live catalog.
// Note: every current free model is a reasoning model, so the client caps
// reasoning effort and falls through to the next model on empty responses.
const OPENROUTER_TEXT_FALLBACKS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "qwen/qwen3.8-27b:free",
  "google/gemma-4-31b-it:free",
  "openrouter/free",
];

const OPENROUTER_VISION_FALLBACKS = [
  "qwen/qwen3.8-27b:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openrouter/free",
];

function openRouterCandidates(hasImages: boolean): string[] {
  const override = hasImages ? env("OPENROUTER_VISION_MODEL") : env("OPENROUTER_MODEL");
  const fallbacks = hasImages ? OPENROUTER_VISION_FALLBACKS : OPENROUTER_TEXT_FALLBACKS;
  const list = override ? [override, ...fallbacks] : fallbacks;
  return [...new Set(list)];
}

/** Which provider will be used with the current env — first match wins. */
export function resolveProvider(): { id: ProviderId; model: string } | null {
  if (env("OPENROUTER_API_KEY")) {
    return {
      id: "openrouter",
      model: openRouterCandidates(false)[0] as string,
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
    return callOpenRouter(messages, options);
  }

  if (provider.id === "xai") {
    return callOpenAICompatible({
      name: "xai",
      url: "https://api.x.ai/v1/chat/completions",
      apiKey: env("XAI_API_KEY") as string,
      messages,
      options,
      model: provider.model,
    });
  }

  return callOpenAICompatible({
    name: "zai",
    url: "https://api.z.ai/api/paas/v4/chat/completions",
    apiKey: env("Z_AI_API_KEY") as string,
    messages,
    options,
    model: provider.model,
  });
}

// ---------- OpenRouter with model fallback chain ----------

async function callOpenRouter(
  messages: ChatMessage[],
  options: ChatOptions,
): Promise<ChatCompletion> {
  const candidates = openRouterCandidates(Boolean(options.hasImages));
  let lastError: unknown;

  for (const model of candidates) {
    try {
      return await callOpenAICompatible({
        name: "openrouter",
        url: "https://openrouter.ai/api/v1/chat/completions",
        apiKey: env("OPENROUTER_API_KEY") as string,
        messages,
        options,
        model,
        reasoningControl: true,
        omitMaxTokens: true,
        extraHeaders: {
          "HTTP-Referer": env("APP_URL") || "https://promptreel.vercel.app",
          "X-Title": "PromptReel",
        },
      });
    } catch (err) {
      lastError = err;
      // Retry the next model on: dead endpoints, rate limits, AND empty
      // responses (common with free reasoning models under load).
      const httpFallback = err instanceof LlmHttpError && shouldFallback(err);
      const emptyFallback = err instanceof LlmEmpty;
      if (httpFallback || emptyFallback) {
        console.warn(
          `[llm] openrouter model unusable: ${model} (${httpFallback ? "http" : "empty"}) — trying next`,
        );
        continue;
      }
      throw err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new LlmNetwork("ไม่มีโมเดลที่ใช้ได้บน OpenRouter ในขณะนี้");
}

/** Model-level failures worth retrying with another model. */
function shouldFallback(err: LlmHttpError): boolean {
  if (err.status === 404 || err.status === 429) return true;
  return /no endpoints found|not a valid model|does not exist|model.*unavailable/i.test(
    err.detail,
  );
}

// ---------- OpenAI-compatible caller (shared by all providers) ----------

interface CompatibleCallArgs {
  name: ProviderId;
  url: string;
  apiKey: string;
  messages: ChatMessage[];
  options: ChatOptions;
  model: string;
  extraHeaders?: Record<string, string>;
  /** OpenRouter-only: cap reasoning effort so thinking doesn't eat the token budget. */
  reasoningControl?: boolean;
  /** OpenRouter-only: omit max_tokens so the model can use its full completion budget. */
  omitMaxTokens?: boolean;
}

async function callOpenAICompatible(args: CompatibleCallArgs): Promise<ChatCompletion> {
  const body: Record<string, unknown> = {
    model: args.model,
    messages: args.messages,
    temperature: args.options.temperature ?? 0.85,
    stream: false,
  };
  if (!args.omitMaxTokens) {
    body.max_tokens = args.options.maxTokens ?? 8192;
  }
  if (args.options.responseFormat) {
    body.response_format = args.options.responseFormat;
  }
  if (args.reasoningControl) {
    // Unified OpenRouter param — ignored by non-reasoning models, but keeps
    // reasoning models from burning the whole budget on hidden thinking.
    body.reasoning = { effort: "low", exclude: true };
  }

  console.log(
    `[llm] ${args.name} model: ${args.model} · messages: ${args.messages.length} · images: ${args.options.hasImages ? "yes" : "no"}`,
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${args.apiKey}`,
    ...args.extraHeaders,
  };

  let response: Response;
  try {
    response = await fetch(args.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      // Hard stop so a hung provider can't stall the serverless function.
      signal: AbortSignal.timeout(115_000),
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
      choices?: {
        finish_reason?: string | null;
        message?: {
          content?: string | { type?: string; text?: string }[] | null;
          reasoning?: string | null;
        };
      }[];
    };
    const choice = json.choices?.[0];
    const msg = choice?.message;
    // Some providers return content as an array of typed parts.
    let content = "";
    if (typeof msg?.content === "string") {
      content = msg.content;
    } else if (Array.isArray(msg?.content)) {
      content = msg.content
        .map((p) => (typeof p === "string" ? p : (p?.text ?? "")))
        .join("");
    }
    content = content.trim();
    if (!content) {
      // Reasoning models often spend everything on thinking and leave
      // `content` empty — log enough detail to debug from server logs.
      console.warn(
        `[llm] ${args.name} ${args.model} empty content · finish_reason=${choice?.finish_reason ?? "?"} · reasoning_preview=${String(msg?.reasoning ?? "none").slice(0, 200)}`,
      );
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
