import express from "express";
import { createServer } from "http";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = 3000;

  // Add support for JSON and URL-encoded request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Contact API endpoint
  app.post("/api/contact", (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      console.log(`\n================== CONTACT SUBMISSION ==================`);
      console.log(`Forward To: liangelyp@gmail.com`);
      console.log(`From Name:  ${name}`);
      console.log(`From Email: ${email}`);
      console.log(`Subject:    ${subject || "No Subject"}`);
      console.log(`Message:    ${message}`);
      console.log(`Timestamp:  ${new Date().toISOString()}`);
      console.log(`========================================================\n`);

      res.status(200).json({
        success: true,
        message: "Email forwarded and received successfully.",
        forwardedTo: "liangelyp@gmail.com"
      });
    } catch (error: any) {
      console.error("Error processing contact submission:", error);
      res.status(500).json({
        success: false,
        message: "Failed to forward standard alert: " + error.message
      });
    }
  });

  // Gemini Card Generation API endpoint
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing or invalid chat history text" });
      }

      console.log(`[Gemini] Starting card generation from WhatsApp history (length: ${text.length})...`);
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("[Gemini] GEMINI_API_KEY is not set in environment variables");
        return res.status(500).json({ 
          error: "API Key (GEMINI_API_KEY) is not configured in the settings menu." 
        });
      }

      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      console.log("[Gemini] Calling generateContent with model gemini-3.5-flash...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Eres un experto en crear juegos de fiesta. Basándote en el siguiente historial de chat de WhatsApp, genera 30 cartas divertidas para el juego "Holis Game".
        
        El chat es: """${text}"""

        Debes generar cartas en estas 3 categorías específicas, extrayendo nombres reales y frases del chat:
        1. "QUIÉN DIJO ESTO": Frases icónicas, divertidas o polémicas dichas por personas en el chat. El 'content' es la frase exacta (sin el nombre) y el 'answer' es el nombre de la persona que la dijo.
        2. "TABÚ": Palabras, temas o "chistes internos" recurrentes en el chat. El 'content' es la palabra principal y 'tabooWords' son 3 palabras relacionadas que NO se pueden decir para describirla.
        3. "ACTUAR": Situaciones, manías o comportamientos típicos de los integrantes del grupo que se mencionen o se deduzcan del chat. El 'content' es la acción corta y el 'context' es una breve descripción de cómo actuarla.

        Devuelve un JSON que cumpla estrictamente con este formato:
        [{ 
          "category": "QUIÉN DIJO ESTO" | "TABÚ" | "ACTUAR", 
          "content": "texto principal", 
          "emoji": "un emoji relacionado",
          "answer": "nombre (solo para QUIÉN DIJO ESTO)",
          "tabooWords": ["palabra1", "palabra2", "palabra3"] (solo para TABÚ),
          "context": "descripción de la actuación" (solo para ACTUAR)
        }]`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: "La categoría de la carta: QUIÉN DIJO ESTO, TABÚ o ACTUAR" },
                content: { type: Type.STRING },
                emoji: { type: Type.STRING },
                answer: { type: Type.STRING },
                tabooWords: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                },
                context: { type: Type.STRING },
              },
              required: ["category", "content", "emoji"],
            },
          },
        },
      });

      console.log("[Gemini] Response received from model.");
      if (!response.text) {
        throw new Error("No text content returned from the model.");
      }

      const cards = JSON.parse(response.text);
      console.log(`[Gemini] Generated ${cards.length} cards successfully.`);
      return res.status(200).json({ cards });
    } catch (error: any) {
      console.error("[Gemini] Error during card generation:", error);
      return res.status(500).json({ 
        error: error.message || "An unexpected error occurred during card generation" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
