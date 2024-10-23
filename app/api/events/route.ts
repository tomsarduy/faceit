export async function GET(_: Request) {
  // Create a new TransformStream
  // This stream will be used to send data to the clients
  // Supported by default in nextJs, nice!
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const sendData = (data: ApiPost) => {
    writer.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  (globalThis as any).sendSSEData = sendData;

  writer.write(`pong\n\n`);

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
