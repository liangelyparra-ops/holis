import express from "express";
import { createServer } from "http";
import path from "path";
import { readFileSync } from "fs";

// Load Firebase config for server-side Firestore REST API calls
let firebaseConfig: { projectId: string; firestoreDatabaseId: string; apiKey: string } | null = null;
try {
  const raw = readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8");
  firebaseConfig = JSON.parse(raw);
} catch {
  console.warn("[Firestore] Could not load firebase-applet-config.json");
}

const FIRESTORE_BASE = firebaseConfig
  ? `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/games`
  : null;

const API_KEY = firebaseConfig?.apiKey ?? "";

/** Convert a plain JS value into a Firestore REST API value object */
function toFirestoreValue(val: unknown): unknown {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/** Convert a Firestore REST API value object back to a plain JS value */
function fromFirestoreValue(val: any): unknown {
  if (!val || typeof val !== "object") return val;
  if ("nullValue" in val) return null;
  if ("booleanValue" in val) return val.booleanValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return val.doubleValue;
  if ("stringValue" in val) return val.stringValue;
  if ("arrayValue" in val) return (val.arrayValue.values ?? []).map(fromFirestoreValue);
  if ("mapValue" in val) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries((val.mapValue.fields ?? {}) as Record<string, unknown>)) {
      obj[k] = fromFirestoreValue(v);
    }
    return obj;
  }
  return val;
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = 3000;

  // Add support for JSON and URL-encoded request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ─── Multimedia Gallery: Firestore proxy (server-side REST API) ───────────
  // The client Firebase SDK cannot reliably connect to Firestore in the Cloud Run
  // environment, so all persistence goes through these server-side endpoints instead.

  /** GET /api/gallery — returns the current gallery items array */
  app.get("/api/gallery", async (_req, res) => {
    if (!FIRESTORE_BASE) return res.status(503).json({ error: "Firebase not configured" });
    try {
      const response = await fetch(`${FIRESTORE_BASE}/multimedia_gallery_live?key=${API_KEY}`);
      const data: any = await response.json();
      if (data.error) {
        console.error("[Gallery GET] Firestore error:", data.error);
        return res.status(500).json({ error: data.error.message });
      }
      if (!data.fields) return res.json({ items: [] });
      const items = fromFirestoreValue(data.fields.items) ?? [];
      return res.json({ items });
    } catch (err: any) {
      console.error("[Gallery GET] fetch error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  /** POST /api/gallery — saves items array to Firestore */
  app.post("/api/gallery", async (req, res) => {
    if (!FIRESTORE_BASE) return res.status(503).json({ error: "Firebase not configured" });
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: "items must be an array" });
    try {
      const fields = {
        items: toFirestoreValue(items),
        updatedAt: toFirestoreValue(Date.now()),
      };
      const response = await fetch(
        `${FIRESTORE_BASE}/multimedia_gallery_live?key=${API_KEY}&updateMask.fieldPaths=items&updateMask.fieldPaths=updatedAt`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        }
      );
      const data: any = await response.json();
      if (data.error) {
        console.error("[Gallery POST] Firestore error:", data.error);
        return res.status(500).json({ error: data.error.message });
      }
      console.log(`[Gallery POST] Saved ${items.length} items to Firestore`);
      return res.json({ ok: true, count: items.length });
    } catch (err: any) {
      console.error("[Gallery POST] fetch error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  /** GET /api/page-content — returns the page texts/content object */
  app.get("/api/page-content", async (_req, res) => {
    if (!FIRESTORE_BASE) return res.status(503).json({ error: "Firebase not configured" });
    try {
      const response = await fetch(`${FIRESTORE_BASE}/multimedia_page_content_live?key=${API_KEY}`);
      const data: any = await response.json();
      if (data.error) {
        console.error("[Content GET] Firestore error:", data.error);
        return res.status(500).json({ error: data.error.message });
      }
      if (!data.fields) return res.json({ content: null });
      const content = fromFirestoreValue(data.fields.content) ?? null;
      return res.json({ content });
    } catch (err: any) {
      console.error("[Content GET] fetch error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  /** POST /api/page-content — saves page content object to Firestore */
  app.post("/api/page-content", async (req, res) => {
    if (!FIRESTORE_BASE) return res.status(503).json({ error: "Firebase not configured" });
    const { content } = req.body;
    if (!content || typeof content !== "object") return res.status(400).json({ error: "content must be an object" });
    try {
      const fields = {
        content: toFirestoreValue(content),
        updatedAt: toFirestoreValue(Date.now()),
      };
      const response = await fetch(
        `${FIRESTORE_BASE}/multimedia_page_content_live?key=${API_KEY}&updateMask.fieldPaths=content&updateMask.fieldPaths=updatedAt`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        }
      );
      const data: any = await response.json();
      if (data.error) {
        console.error("[Content POST] Firestore error:", data.error);
        return res.status(500).json({ error: data.error.message });
      }
      console.log("[Content POST] Saved page content to Firestore");
      return res.json({ ok: true });
    } catch (err: any) {
      console.error("[Content POST] fetch error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Legacy contact logging endpoint. This does not deliver email.
  app.post("/api/contact", (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      console.log(`\n================== CONTACT SUBMISSION ==================`);
      console.log(`Portfolio owner: liangelyp@gmail.com`);
      console.log(`From Name:  ${name}`);
      console.log(`From Email: ${email}`);
      console.log(`Subject:    ${subject || "No Subject"}`);
      console.log(`Message:    ${message}`);
      console.log(`Timestamp:  ${new Date().toISOString()}`);
      console.log(`========================================================\n`);

      res.status(200).json({
        success: true,
        delivered: false,
        message: "Submission logged on the server. No email delivery is configured."
      });
    } catch (error: any) {
      console.error("Error processing contact submission:", error);
      res.status(500).json({
        success: false,
        message: "Failed to log contact submission: " + error.message
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
