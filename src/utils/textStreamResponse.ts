export function textStreamResponse(chunks: AsyncGenerator<string>, abort: () => void) {
  const encoder = new TextEncoder();
  let atStart = true;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { value, done } = await chunks.next();
        if (done) {
          controller.close();
          return;
        }
        const text = atStart ? value.trimStart() : value;
        if (text) {
          atStart = false;
          controller.enqueue(encoder.encode(text));
          return;
        }
      }
    },
    async cancel() {
      abort();
      await chunks.return(undefined);
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
