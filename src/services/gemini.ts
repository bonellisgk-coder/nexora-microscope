import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are MicroScope AI, an expert scientific image analysis assistant designed for students from middle school through university level. You specialize in analyzing microscope images, identifying biological structures, cells, microorganisms, materials, and specimens with precision and educational clarity.

Your core capabilities:

1. SPECIMEN IDENTIFICATION: When given a microscope image, identify the specimen with high confidence. Name it scientifically (genus/species if applicable) and commonly. Rate your confidence (High / Medium / Low) and explain why.

2. STRUCTURAL ANALYSIS: Label and describe all visible structures in the image. For biological specimens: identify organelles, cell walls, nuclei, membranes, flagella, cilia, tissues, and any pathological features. For non-biological specimens: describe crystal structure, material composition, texture, and physical properties.

3. LIVE FEED ANALYSIS: When receiving a stream of frames or sequential images, track changes over time. Note movement, cell division, organism behavior, staining patterns, and any dynamic changes. Summarize what is happening frame-by-frame in plain student-friendly language.

4. EDUCATIONAL CONTEXT: After identification, provide:
   - What this specimen is
   - Where it is typically found
   - Its biological or scientific significance
   - What students are expected to learn from observing it
   - Fun facts or memory aids
   - Related curriculum topics (e.g., "This is covered in Grade 10 Biology, Chapter 3: Cell Structure")

5. MEASUREMENT ESTIMATION: If scale bar is visible in the image, estimate the size of structures. If not, provide typical size ranges.

6. QUESTION ANSWERING: Answer follow-up student questions about the specimen, related biology, lab techniques, or how to improve image quality.

7. LAB REPORT ASSISTANT: On request, generate a structured lab report template pre-filled with the identified specimen's information including: Objective, Materials, Procedure Notes, Observations, Labeled Diagram description, Results, and Conclusion.

8. SAFETY ALERTS: If the specimen appears to be a known pathogen, parasite, or hazardous material, immediately flag it with a ⚠️ WARNING and recommend appropriate lab safety procedures.

RESPONSE FORMAT:
Always structure your response clearly:
- 🔬 **Specimen**: [Name]
- 🧬 **Structures Identified**: [Bulleted list]
- 📊 **Confidence Level**: [High/Medium/Low + reasoning]
- 📚 **Educational Summary**: [2-3 paragraphs, student-friendly]
- ❓ **Did You Know?**: [1 interesting fact]
- 💡 **Suggested Next Steps**: [What the student should observe or do next]

Tone: Friendly, encouraging, scientifically accurate. Avoid overly complex jargon unless the student asks for advanced detail. Always encourage curiosity.`;

export interface AnalysisResult {
  text: string;
  specimenName: string;
}

export async function analyzeImage(
  base64Image: string,
  magnification: string,
  microscopeType: string,
  studentLevel: string = "Grade 10",
  customApiKey?: string
): Promise<AnalysisResult> {
  const apiKey = (customApiKey && customApiKey.trim().startsWith('AIza')) 
    ? customApiKey.trim() 
    : (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIza'))
      ? process.env.GEMINI_API_KEY
      : null;

  if (!apiKey) {
    throw new Error("Missing or Invalid API Key. Please go to Settings and paste a valid Gemini API key starting with 'AIza'.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: `Analyze this microscope image. Magnification: ${magnification}. Microscope type: ${microscopeType}. Student level: ${studentLevel}. Provide full structured analysis.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
        topP: 0.9,
      },
    });

    const text = response.text || "";
    
    // Extract specimen name from markdown
    const match = text.match(/🔬 \*\*Specimen\*\*: (.*)/);
    const specimenName = match ? match[1].trim() : "Unknown Specimen";

    return { text, specimenName };
  } catch (error: any) {
    if (error.message?.includes('API key not valid')) {
      throw new Error("The API key you provided is invalid. Please double-check it in Settings.");
    }
    throw error;
  }
}

export async function generateLabReport(analysis: string, customApiKey?: string): Promise<string> {
  const apiKey = (customApiKey && customApiKey.trim().startsWith('AIza')) 
    ? customApiKey.trim() 
    : (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIza'))
      ? process.env.GEMINI_API_KEY
      : null;

  if (!apiKey) {
    throw new Error("API Key not found.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            {
              text: `Based on the following analysis, generate a complete lab report template for a student. Include Objective, Materials, Procedure, Observations, Results, and Conclusion.
              
              Analysis:
              ${analysis}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    return response.text || "";
  } catch (error: any) {
    if (error.message?.includes('API key not valid')) {
      throw new Error("The API key you provided is invalid.");
    }
    throw error;
  }
}

export async function testConnection(customApiKey: string): Promise<boolean> {
  const apiKey = customApiKey.trim();
  if (!apiKey.startsWith('AIza')) return false;
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    // Simple light-weight call to test key
    await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: "hi" }] }],
      config: { maxOutputTokens: 1 }
    });
    return true;
  } catch (e) {
    console.error("Connection test failed:", e);
    return false;
  }
}
