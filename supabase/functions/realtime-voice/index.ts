import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, upgrade",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;

  socket.onopen = () => {
    console.log("Client connected");
    
    // Connect to OpenAI Realtime API
    openAISocket = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1"
        }
      }
    );

    openAISocket.onopen = () => {
      console.log("Connected to OpenAI");
    };

    openAISocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("OpenAI event:", data.type);

      // Send session update after receiving session.created
      if (data.type === "session.created") {
        const sessionUpdate = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: "You are Lux, a luxury interior design AI assistant for LuxInnovate Interiors. Help users find furniture, suggest designs, and answer questions about luxury interiors. Be professional, friendly, and knowledgeable about interior design trends.",
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8,
            max_response_output_tokens: "inf"
          }
        };
        openAISocket?.send(JSON.stringify(sessionUpdate));
        console.log("Session update sent");
      }

      // Forward all messages to client
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
      }
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI error:", error);
      socket.close();
    };

    openAISocket.onclose = () => {
      console.log("OpenAI disconnected");
      socket.close();
    };
  };

  socket.onmessage = (event) => {
    // Forward client messages to OpenAI
    if (openAISocket?.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    openAISocket?.close();
  };

  socket.onerror = (error) => {
    console.error("Socket error:", error);
    openAISocket?.close();
  };

  return response;
});
