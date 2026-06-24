import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load local environment configurations if present
dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "20mb" })); // Support large state payloads

  // Server-side AI chat router proxy
  app.post("/api/ai/chat", async (req, res) => {
    const { message, lifeState } = req.body;

    if (!message) {
      res.status(400).json({ error: "Missing prompt message" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(400).json({ 
        reply: "⚠️ **Gemini API Key is not configured yet.**\n\nPlease add your `GEMINI_API_KEY` in **Settings > Secrets** panel in the AI Studio interface to wake up your Life OS personal copilot." 
      });
      return;
    }

    try {
      // Lazy initialize GoogleGenAI with the recommended User-Agent telemetry headers
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Construct a contextual grounding instruction using their live state database
      const profileInfo = lifeState?.profile ? `User Profile: Name is ${lifeState.profile.fullName} (${lifeState.profile.nickname}). Title: ${lifeState.profile.headline}. Email: ${lifeState.profile.email}. Github: ${lifeState.profile.githubUrl}. Upwork: ${lifeState.profile.upworkUrl}.` : "User Profile is not set yet.";
      
      const projectsList = lifeState?.projects?.length 
        ? `Projects:\n${lifeState.projects.map((p: any) => `- ${p.title}: ${p.description} (Tech: ${p.techStack?.join(", ")})`).join("\n")}` 
        : "No engineering projects uploaded yet.";

      const applicationsList = lifeState?.applications?.length 
        ? `Applications:\n${lifeState.applications.map((a: any) => `- ${a.company} - ${a.position} (Status: ${a.status}, Interview: ${a.interviewDate || "N/A"})`).join("\n")}` 
        : "No active job hunting applications tracked.";

      const goalsList = lifeState?.goals?.length 
        ? `Goals:\n${lifeState.goals.map((g: any) => `- ${g.title} (${g.timeframe} target, Completed: ${g.completed})`).join("\n")}` 
        : "No targets or goals set yet.";

      const careerList = lifeState?.career?.length 
        ? `Work Experience:\n${lifeState.career.map((c: any) => `- ${c.role} at ${c.company} (${c.duration}). Achievements: ${c.achievements?.join("; ")}`).join("\n")}` 
        : "No professional experience listed.";

      const skillsList = lifeState?.skills?.length 
        ? `Skills Matrix:\n${lifeState.skills.map((s: any) => `- ${s.name} (${s.level} level, Category: ${s.category})`).join("\n")}` 
        : "No skills listed.";

      const financeSaaS = lifeState?.subscriptions?.length 
        ? `Finance Subscriptions:\n${lifeState.subscriptions.map((s: any) => `- ${s.serviceName}: $${s.cost}/${s.billingCycle} (Active: ${s.active})`).join("\n")}` 
        : "No subscriptions listed.";

      const systemInstruction = `You are the "Life OS AI Copilot", an elite, supportive, and context-grounded personal AI adviser.
The user is running the "Life OS" centralized digital vault application to coordinate their career, learning milestones, and operations.

Below is the structured data of their secure Life OS digital vaults:
===================
${profileInfo}

${projectsList}

${applicationsList}

${goalsList}

${careerList}

${skillsList}

${financeSaaS}
===================

Your Directives:
1. Always base your replies, strategies, advice, and summaries directly on the user's real profile details, projects, job hunts, and goals listed above.
2. If they ask about information not in their vault, acknowledge it simply and encourage them to populate that module in their Life OS sidebar.
3. Be friendly, incredibly professional, precise, and objective. Speak directly and with premium composure.
4. Format all responses cleanly using standard Markdown (lists, code-blocks, bold text, brief tables).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const reply = response.text || "I processed your request, but did not receive any textual response from Gemini.";
      res.json({ reply });

    } catch (err: any) {
      console.error("Gemini API error inside server proxy:", err);
      res.status(500).json({ 
        reply: `❌ **Failed to consult Gemini AI:** ${err.message || "Unknown error occurred."}\n\nValidate your API credentials in AI Studio Settings > Secrets.`
      });
    }
  });

  // Serve Vite in development, static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
