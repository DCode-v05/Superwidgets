import { NextRequest } from "next/server";
import { runEngine } from "@/lib/engine/run-engine";
import { isProviderId, type ProviderId } from "@/lib/engine/providers";
import type { EngineEvent } from "@/lib/types/engine-widgets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  providerId?: ProviderId;
  useSkill?: boolean;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RequestBody;
  const encoder = new TextEncoder();

  const providerId: ProviderId = isProviderId(body.providerId)
    ? body.providerId
    : "sonnet";
  const useSkill = body.useSkill === true;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: EngineEvent) => {
        const eventLine = `event: ${event.type}\n`;
        const dataLine = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(eventLine + dataLine));
      };

      try {
        for await (const ev of runEngine(body.message, body.history ?? [], {
          providerId,
          useSkill,
        })) {
          sendEvent(ev);
        }
        sendEvent({ type: "done" });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        sendEvent({ type: "error", message });
        sendEvent({ type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
