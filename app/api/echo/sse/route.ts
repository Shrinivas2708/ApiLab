export const runtime = "nodejs";

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  let interval: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      let count = 0;

      interval = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: Message ${++count}\n\n`)
          );
        } catch (err) {
          // Controller already closed, stop silently
          clearInterval(interval);
        }
      }, 1000);
    },

    cancel() {
      clearInterval(interval);
    },
  });

  // ✅ VERY IMPORTANT: stop stream when client disconnects
  req.signal.addEventListener("abort", () => {
    clearInterval(interval);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
