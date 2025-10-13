import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder, AudioQueue, encodeAudioForAPI, createWavFromPCM } from "@/utils/RealtimeVoice";

export function VoiceAssistant() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    try {
      // Initialize audio context and queue
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        audioQueueRef.current = new AudioQueue(audioContextRef.current);
      }

      // Connect to WebSocket
      const ws = new WebSocket(
        "wss://nyvgmkkzqmlweodetqvi.supabase.co/functions/v1/realtime-voice"
      );

      ws.onopen = async () => {
        console.log("Connected to voice assistant");
        setIsConnected(true);
        
        toast({
          title: "Voice Assistant Active",
          description: "Say 'Hey Lux' to start speaking",
        });

        // Start recording audio
        recorderRef.current = new AudioRecorder((audioData) => {
          if (ws.readyState === WebSocket.OPEN && isListening) {
            const encoded = encodeAudioForAPI(audioData);
            ws.send(JSON.stringify({
              type: "input_audio_buffer.append",
              audio: encoded
            }));
          }
        });

        await recorderRef.current.start();
        setIsListening(true);
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("Event:", data.type);

        switch (data.type) {
          case "response.audio.delta":
            setIsSpeaking(true);
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await audioQueueRef.current?.addToQueue(bytes);
            break;

          case "response.audio.done":
            setIsSpeaking(false);
            break;

          case "response.audio_transcript.delta":
            setTranscript(prev => prev + data.delta);
            break;

          case "conversation.item.input_audio_transcription.completed":
            console.log("User said:", data.transcript);
            break;

          case "error":
            console.error("Error from server:", data.error);
            toast({
              title: "Error",
              description: data.error.message || "An error occurred",
              variant: "destructive",
            });
            break;
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice assistant",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        console.log("Disconnected from voice assistant");
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        title: "Error",
        description: "Failed to initialize voice assistant",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    recorderRef.current?.stop();
    wsRef.current?.close();
    audioQueueRef.current?.clear();
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript("");
  };

  const toggleMute = () => {
    setIsListening(!isListening);
  };

  return (
    <Card className="fixed bottom-24 right-8 w-80 shadow-lg z-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Voice Assistant
          </h3>
          {isConnected && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className={isListening ? "text-primary" : "text-muted-foreground"}
            >
              {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {transcript && (
          <div className="p-3 bg-muted rounded-md text-sm max-h-32 overflow-y-auto">
            {transcript}
          </div>
        )}

        <div className="flex items-center justify-between">
          {!isConnected ? (
            <Button onClick={connect} className="w-full">
              <Mic className="h-4 w-4 mr-2" />
              Start Voice Assistant
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isSpeaking ? "Speaking..." : "Listening..."}
              </div>
              <Button onClick={disconnect} variant="destructive" size="sm">
                Disconnect
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Say "Hey Lux, suggest me a luxury office chair" or ask any interior design questions.
        </p>
      </CardContent>
    </Card>
  );
}
