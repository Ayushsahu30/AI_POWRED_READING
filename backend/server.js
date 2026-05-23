import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

console.log("GEMINI_API_KEY present?", !!process.env.GEMINI_API_KEY);
console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY?.length);

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Utility: simple word count
function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Utility: simple similarity (Jaccard over words)
function textSimilarity(a, b) {
  const setA = new Set(
    a
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
  const setB = new Set(
    b
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );

  const intersectionSize = [...setA].filter((w) => setB.has(w)).length;
  const unionSize = new Set([...setA, ...setB]).size || 1;
  return intersectionSize / unionSize;
}

// Clarification endpoint
app.post("/api/clarify", async (req, res) => {
  try {
    const { paragraph, level } = req.body;

    if (!paragraph || !level) {
      return res
        .status(400)
        .json({ error: "paragraph and level (1 or 2) are required" });
    }

    const levelDescription =
      level === 1
        ? "Level 1: brief, simple clarification suitable for a student. 3-6 sentences max."
        : "Level 2: more detailed, step-by-step clarification with examples. 6-10 sentences max.";

    const prompt = `
You are a helpful reading tutor.

The student just read this paragraph:

"""${paragraph}"""

Provide a ${levelDescription}

Do NOT mention that this is Level 1 or Level 2 in your answer. Just give the explanation.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are a clear, kind reading tutor.",
        temperature: 0.5,
        maxOutputTokens: 400,
      }
    });

    const clarification =
      response.text?.trim() ||
      "Sorry, I could not generate a clarification.";

    res.json({ clarification });
  } catch (error) {
    console.error("Error in /api/clarify:", error);
    res.status(500).json({ error: "Failed to generate clarification." });
  }
});

// Teach-back evaluation endpoint
app.post("/api/evaluate-teachback", async (req, res) => {
  try {
    const {
      paragraph,
      teachback,
      minWords = 20,
      similarityThreshold = 0.75
    } = req.body;

    if (!paragraph || typeof teachback !== "string") {
      return res
        .status(400)
        .json({ error: "paragraph and teachback are required" });
    }

    const trimmedTeachback = teachback.trim();

    // (a) Empty check
    if (!trimmedTeachback) {
      return res.json({
        status: "NOT_ACCEPTED",
        reason: "Teach-back is empty.",
        modelDecision: null
      });
    }

    // (b) Minimum length check
    const wordCount = countWords(trimmedTeachback);
    if (wordCount < minWords) {
      return res.json({
        status: "NOT_ACCEPTED",
        reason: `Teach-back must be at least ${minWords} words.`,
        modelDecision: null
      });
    }

    // (c) Text similarity check
    const similarity = textSimilarity(paragraph, trimmedTeachback);
    if (similarity >= similarityThreshold) {
      return res.json({
        status: "NOT_ACCEPTED",
        reason:
          "Teach-back copies too much of the original paragraph (similarity too high).",
        modelDecision: null
      });
    }

    // (d) Text service evaluation
    const evalPrompt = `
You are evaluating whether a student's "teach-back" truly shows understanding of a paragraph.

You will receive:
- The original paragraph the student read
- The student's teach-back (their explanation in their own words)

Respond ONLY with strict JSON in this exact format:
{"decision":"ACCEPTED" or "NOT_ACCEPTED","explanation":"a brief reason"}

Rules:
- ACCEPTED if the student captures the main idea(s) in their own words and shows genuine understanding, even if imperfect.
- NOT_ACCEPTED if the response is off-topic, significantly incorrect, or just rephrases without showing understanding.

Original paragraph:
"""${paragraph}"""

Student teach-back:
"""${trimmedTeachback}"""
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: evalPrompt,
      config: {
        systemInstruction: "You are a strict but fair evaluator. Only emit valid JSON, no other text.",
        temperature: 0,
        maxOutputTokens: 200,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            decision: {
              type: "STRING",
              enum: ["ACCEPTED", "NOT_ACCEPTED"]
            },
            explanation: {
              type: "STRING"
            }
          },
          required: ["decision", "explanation"]
        }
      }
    });

    const raw = response.text?.trim() || "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.warn("Failed to parse model JSON, raw:", raw);
      return res.json({
        status: "NOT_ACCEPTED",
        reason: "Evaluation service returned invalid JSON.",
        modelDecision: raw
      });
    }

    const decision =
      parsed.decision === "ACCEPTED" || parsed.decision === "NOT_ACCEPTED"
        ? parsed.decision
        : "NOT_ACCEPTED";

    const resultStatus = decision === "ACCEPTED" ? "ACCEPTED" : "NOT_ACCEPTED";

    res.json({
      status: resultStatus,
      reason: parsed.explanation || "No explanation provided.",
      modelDecision: parsed
    });
  } catch (error) {
    console.error("Error in /api/evaluate-teachback:", error);
    res.status(500).json({ error: "Failed to evaluate teach-back." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

app.post("/api/trace", async (req, res) => {
  try {
    const { paragraph, selectedText } = req.body;

    if (!paragraph || !selectedText) {
      return res.status(400).json({
        error: "paragraph and selectedText required"
      });
    }

    if (selectedText.trim().length < 5) {
      return res.status(400).json({
        error: "Selection too short."
      });
    }

    const prompt = `
You are a helpful reading tutor.

Full paragraph:
"""${paragraph}"""

Selected text:
"""${selectedText}"""

Explain what the selected text means in context.

Provide EXACTLY 3 different explanations.

Return STRICT JSON only in this format:
{"variants":["exp1","exp2","exp3"]}

No extra text.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "Output valid JSON only. No markdown. No extra words.",
        temperature: 0.4,
        maxOutputTokens: 600,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            variants: {
              type: "ARRAY",
              items: {
                type: "STRING"
              }
            }
          },
          required: ["variants"]
        }
      }
    });

    const raw = response.text?.trim() || "";

    // 🔥 Extract JSON safely (handles accidental extra text)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.variants || parsed.variants.length !== 3) {
      throw new Error("Invalid variant count");
    }

    res.json(parsed);

  } catch (err) {
    console.error("Trace error:", err);

    res.status(500).json({
      error: "Trace generation failed"
    });
  }
});


app.post("/api/last-chance", async (req, res) => {
  try {
    const { paragraph } = req.body;

    if (!paragraph) {
      return res.status(400).json({ error: "paragraph required" });
    }

    const prompt = `
You are a reading tutor helping a struggling student.

The student did not understand this paragraph:

"""${paragraph}"""

Generate exactly 10 DIFFERENT simplified versions of this paragraph.

Rules:
- Keep core meaning intact.
- Each version must be distinct.
- Make language progressively simpler.
- Do NOT shorten excessively.
- Do NOT number the versions.

Return ONLY strict JSON:
{"variants":["v1","v2","v3","v4","v5","v6","v7","v8","v9","v10"]}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "Output valid JSON only.",
        temperature: 0.5,
        maxOutputTokens: 1200,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            variants: {
              type: "ARRAY",
              items: {
                type: "STRING"
              }
            }
          },
          required: ["variants"]
        }
      }
    });

    const raw = response.text?.trim() || "";
    const parsed = JSON.parse(raw);

    if (!parsed.variants || parsed.variants.length !== 10) {
      throw new Error("Invalid variant count");
    }

    res.json(parsed);

  } catch (err) {
    console.error("Last chance error:", err);
    res.status(500).json({ error: "Last chance generation failed" });
  }
});

// Word definition endpoint (long-press feature)
// Uses free dictionary API first, falls back to Gemini for context-aware definitions
app.post("/api/define-word", async (req, res) => {
  try {
    const { word, sentence } = req.body;

    if (!word) {
      return res.status(400).json({ error: "word is required" });
    }

    const cleanWord = word.toLowerCase().trim();

    // --- Try free dictionary API first (fast, no rate limits) ---
    try {
      const dictResponse = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
      );

      if (dictResponse.ok) {
        const dictData = await dictResponse.json();
        const entry = dictData[0];

        if (entry) {
          const meaning = entry.meanings?.[0];
          const firstDef = meaning?.definitions?.[0];

          const result = {
            word: entry.word || cleanWord,
            phonetic: entry.phonetic || entry.phonetics?.find(p => p.text)?.text || "",
            partOfSpeech: meaning?.partOfSpeech || "",
            definition: firstDef?.definition || "No definition found.",
            example: firstDef?.example || ""
          };

          return res.json(result);
        }
      }
    } catch (dictErr) {
      console.log("Free dictionary API failed, falling back to Gemini:", dictErr.message);
    }

    // --- Fallback: Gemini AI (for rare/context-specific words) ---
    const contextClause = sentence
      ? `\nThe word appears in this sentence: """${sentence}"""\nProvide the meaning that fits this specific context.`
      : "";

    const prompt = `
You are a concise dictionary assistant.

Define the word: "${cleanWord}"${contextClause}

Return STRICT JSON only in this format:
{"word":"${cleanWord}","phonetic":"phonetic pronunciation","partOfSpeech":"noun/verb/adj/etc","definition":"clear 1-2 sentence definition","example":"a short example sentence using the word"}

Keep the definition simple and clear. No extra text.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "Output valid JSON only. No markdown. No extra words.",
        temperature: 0.3,
        maxOutputTokens: 300,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            word: { type: "STRING" },
            phonetic: { type: "STRING" },
            partOfSpeech: { type: "STRING" },
            definition: { type: "STRING" },
            example: { type: "STRING" }
          },
          required: ["word", "definition"]
        }
      }
    });

    const raw = response.text?.trim() || "";

    if (!raw) {
      throw new Error("Empty response from Gemini");
    }

    // Try direct parse first, then regex extraction as fallback
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      parsed = JSON.parse(jsonMatch[0]);
    }

    res.json(parsed);

  } catch (err) {
    console.error("Define word error:", err.message || err);
    res.status(500).json({ error: "Word definition failed" });
  }
});
