import Fastify from "fastify";
import WebSocket from "ws";
import dotenv from "dotenv";
import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";
import { searchAmazonTool, sendEmailTool } from "../../components/tools";

dotenv.config();

const { NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID } = process.env;

// Check for the required ElevenLabs Agent ID
if (!NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID) {
  console.error("Missing NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID in environment variables");
  process.exit(1);  
}

// Initialize Fastify server
const fastify = Fastify({logger: true});
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

const PORT = process.env.PORT || 8000;

// Root route for health check
fastify.get("/", async (_, reply) => {
  reply.send({ message: "Server is running" });
});

// Route to handle incoming calls from Twilio
fastify.post("/inbound_call", async (request, reply) => {
  console.log("Received inbound call request:", request.headers);
  
  // Generate TwiML response to connect the call to a WebSocket stream
  const host = request.headers.host || request.hostname || 'localhost:8000';
  console.log(request.body);

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
    <Connect>
        <Stream url="wss://${host}/media-stream" />
    </Connect>
    </Response>`;

  reply.type("text/xml").send(twimlResponse);
});

// WebSocket route for handling media streams from Twilio
fastify.register(async (fastifyInstance) => {
  fastifyInstance.get("/media-stream", { websocket: true }, (connection, req) => {
    console.info("[Server] Twilio connected to media stream.");

    let streamSid: string | null = null;

    // Connect to ElevenLabs Conversational AI WebSocket
    const elevenLabsWs = new WebSocket(
      `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID}`
    );

    // Handle open event for ElevenLabs WebSocket
    elevenLabsWs.on("open", () => {
      console.log("[ElevenLabs] Connected to Conversational AI.");
    });

    elevenLabsWs.on("message", async (data) => {
        try {
            const message = JSON.parse(data.toString());
            if(message.type === "client_tool_call"){
              await handleToolMessage(message)
            } else {
              handleElevenLabsMessage(message, connection);
            }
        } catch (error) {
            console.error("[ElevenLabs] Error parsing message:", error);
        }
    }); 

    // Handle errors from ElevenLabs WebSocket
    elevenLabsWs.on("error", (error) => {
      console.error("[ElevenLabs] WebSocket error:", error);
    });

    // Handle close event for ElevenLabs WebSocket
    elevenLabsWs.on("close", () => {
      console.log("[ElevenLabs] Disconnected.");
    });

    const handleToolMessage = async (message: any) => {
        console.log("Recieved tool message ", message)
        const toolCall = message.client_tool_call;

        if (toolCall.tool_name === "searchAmazon") {
          const query = toolCall.parameters.query;
            console.log(`[Tool] Searching Amazon for: ${query}`);
            try {
              const result = await searchAmazonTool.execute({ query });
              const responseMessage = {
                type: "client_tool_result",
                result,
                tool_call_id: toolCall.tool_call_id,
                is_error: false
              };
              elevenLabsWs.send(JSON.stringify(responseMessage));
            }catch(err){
              console.log("[handleToolMessage] error searching amazon ", err)
            }
        } else if (toolCall.tool_name === "sendEmail"){
          const { to, title, img_thumbnail, asin } = toolCall.parameters;
          console.log(`[Tool] Sending email to ${to} for product: ${title}`);
          try{
            const result = await sendEmailTool.execute({ to, title, img_thumbnail, asin });
            const responseMessage = {
                type: "client_tool_result",
                result,
                tool_call_id: toolCall.tool_call_id,
                is_error: false
            };  
            elevenLabsWs.send(JSON.stringify(responseMessage));
          }catch(err){
            console.log("[handleToolMessage] error sending email ", err)
          }
        } else {
          console.log("Unrecognized tool_name ", toolCall.tool_name)
        }
    }

    // Function to handle messages from ElevenLabs
    const handleElevenLabsMessage = (message: any, connection: any) => {
      switch (message.type) {
        case "conversation_initiation_metadata":
          console.info("[ElevenLabs] Received conversation initiation metadata.");
          break;
        case "audio":
          if (message.audio_event?.audio_base_64) {
            // Send audio data to Twilio
            const audioData = {
              event: "media",
              streamSid,
              media: {
                payload: message.audio_event.audio_base_64,
              },
            };
            connection.send(JSON.stringify(audioData));
          }
          break;
        case "interruption":
          // Clear Twilio's audio queue
          connection.send(JSON.stringify({ event: "clear", streamSid }));
          break;
        case "ping":
          // Respond to ping events from ElevenLabs
          if (message.ping_event?.event_id) {
            const pongResponse = {
              type: "pong",
              event_id: message.ping_event.event_id,
            };
            elevenLabsWs.send(JSON.stringify(pongResponse));
          }
          break;
      }
    };

    // Handle messages from Twilio
    connection.on("message", async (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        switch (data.event) {
          case "start":
            // Store Stream SID when stream starts
            streamSid = data.start.streamSid;
            console.log(`[Twilio] Stream started with ID: ${streamSid}`);
            break;
          case "media":
            // Route audio from Twilio to ElevenLabs
            if (elevenLabsWs.readyState === WebSocket.OPEN) {
              // data.media.payload is base64 encoded
              const audioMessage = {
                user_audio_chunk: Buffer.from(
                  data.media.payload,
                  "base64"
                ).toString("base64"),
              };
              elevenLabsWs.send(JSON.stringify(audioMessage));
            }
            break;
          case "stop":
            // Close ElevenLabs WebSocket when Twilio stream stops
            elevenLabsWs.close();
            break;
          default:
            console.log(`[Twilio] Received unhandled event: ${data.event}`);
        }
      } catch (error) {
        console.error("[Twilio] Error processing message:", error);
      }
    });

    // Handle close event from Twilio
    connection.on("close", () => {
      elevenLabsWs.close();
      console.log("[Twilio] Client disconnected");
    });

    // Handle errors from Twilio WebSocket
    connection.on("error", (error: any) => {
      console.error("[Twilio] WebSocket error:", error);
      elevenLabsWs.close();
    });
  });
});

// Export a function to start the server
export function startTwilioServer() {
  fastify.listen({ port: parseInt(PORT as string), host: '0.0.0.0' }, (err: any) => {
    if (err) {
      console.error("Error starting server:", err);
      process.exit(1);
    }
    console.log(`[Server] Twilio server listening on port ${PORT}`);
  });
  
  return fastify;
} 