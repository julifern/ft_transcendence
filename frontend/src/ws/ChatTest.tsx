import React, { useEffect, useRef } from 'react';

export function ChatTest() {
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
       "wss://" + window.location.host + "/ws/chat/42/"
    );
    socket.current = ws;

    ws.onopen = () => {
      console.log("WebSocket Opened");

      ws.send(
        JSON.stringify({
          message: "Welcome Server",
        })
      );
    };

    ws.onclose = (event: Event) => {
      console.log("WebSocket Closed:", event.code, event.reason);
    };

    ws.onerror = (event: Event) => {
      console.log("Error:", event);
    };

    ws.onmessage = (event: Event) => {
      const data = JSON.parse(event.data);
      console.log("Message:", data.message);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <h1>WebSocket Page</h1>
  );
}