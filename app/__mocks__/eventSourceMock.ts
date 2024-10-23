export default class MockEventSource {
  url: string;
  readyState: number;
  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null = null;
  onerror: ((this: EventSource, ev: Event) => any) | null = null;

  constructor(url: string) {
    this.url = url;
    this.readyState = 0; // CONNECTING
    // Simulate connection establishment
    setTimeout(() => {
      this.readyState = 1; // OPEN
      // You can trigger open event here if needed
    }, 0);
  }

  // Simulate receiving a message
  triggerMessage(data: any) {
    if (this.onmessage) {
      const event = new MessageEvent("message", {
        data: JSON.stringify(data),
      });
      (this.onmessage as any)(event);
    }
  }

  // Simulate an error
  triggerError(error: any) {
    if (this.onerror) {
      const event = new Event("error");
      (this.onerror as any)(event);
    }
  }

  close() {
    this.readyState = 2; // CLOSED
  }
}
