type ResponseInputMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ResponseTool =
  | {
      type: "web_search";
      search_context_size?: "low" | "medium" | "high";
    }
  | {
      type: "x_search";
      from_date?: string;
      to_date?: string;
      allowed_x_handles?: string[];
      excluded_x_handles?: string[];
      enable_image_understanding?: boolean;
      enable_video_understanding?: boolean;
    }
  | {
      type: "code_execution";
    };

type ResponseCreateInput = {
  model?: string;
  reasoning?: {
    effort?: "low" | "medium" | "high" | "xhigh";
  };
  input: ResponseInputMessage[];
  tools?: ResponseTool[];
  text?: {
    format?: {
      type: "json_object";
    };
  };
};

type ResponseCreateOutput =
  | Record<string, unknown>
  | {
      output_text?: string;
      output?: Array<{
        type: string;
        content?: Array<{
          type: string;
          text?: string;
        }>;
      }>;
    };

export type XAIResponsesClient = {
  create: (input: ResponseCreateInput) => Promise<ResponseCreateOutput>;
};

export type XAIClient = {
  responses: XAIResponsesClient;
};

export function createXAIClient(apiKey = process.env.XAI_API_KEY): XAIClient {
  if (!apiKey) {
    throw new Error("XAI_API_KEY is required.");
  }

  return {
    responses: {
      async create(input) {
        const response = await fetch("https://api.x.ai/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(input)
        });

        if (!response.ok) {
          throw new Error(`xAI Responses API failed with status ${response.status}.`);
        }

        return response.json();
      }
    }
  };
}

export function parseJSONResponse(response: ResponseCreateOutput) {
  if ("output_text" in response && typeof response.output_text === "string") {
    return JSON.parse(response.output_text);
  }

  if ("output" in response && Array.isArray(response.output)) {
    const textBlock = response.output
      .flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text" && typeof item.text === "string");

    if (textBlock?.text) {
      return JSON.parse(textBlock.text);
    }
  }

  return response;
}
