import { aiFactCheckResultSchema } from "@/lib/schema/ai";
import type { NormalizedSubmission } from "@/lib/submissions/normalize-input";
import { buildFactCheckPrompt } from "./prompts";
import {
  createXAIClient,
  parseJSONResponse,
  type XAIClient
} from "@/lib/xai/client";
import { validateFactCheckResult } from "./validate-result";

export async function runFactCheck(
  submission: NormalizedSubmission,
  client: XAIClient = createXAIClient()
) {
  const response = await client.responses.create({
    model: process.env.XAI_MODEL ?? "grok-4.20-multi-agent",
    reasoning: {
      effort: "medium"
    },
    input: [
      {
        role: "user",
        content: buildFactCheckPrompt(submission)
      }
    ],
    tools: [
      {
        type: "web_search",
        enable_image_understanding: true
      },
      {
        type: "x_search",
        enable_image_understanding: true
      }
    ]
  });

  const parsedResponse = parseJSONResponse(response);
  const aiResult = aiFactCheckResultSchema.parse(parsedResponse);

  return validateFactCheckResult(aiResult);
}
