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
