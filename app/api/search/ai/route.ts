import { NextResponse } from "next/server";
import { universalSearchIndex } from "@/lib/universal-search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API_KEY_MISSING",
          message: "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // Import bikes dynamically or check reference to enrich the search index
    const { bikes } = require("@/lib/bikes-data");

    // Prepare an enriched representation of the search index to fit in the context window
    const serializedIndex = universalSearchIndex.map((item) => {
      if (item.type === "Bike") {
        const slug = item.id.replace("bike-", "");
        const bike = bikes.find((b: any) => b.slug === slug);
        if (bike) {
          return {
            id: item.id,
            type: item.type,
            title: item.title,
            description: item.description,
            priceBdt: bike.priceBdt,
            specs: {
              powertrain: bike.powertrain,
              displacementCc: bike.displacementCc,
              motorPowerKw: bike.motorPowerKw,
              rangeKm: bike.rangeKm,
              topSpeedKph: bike.topSpeedKph,
              mileageKmpl: bike.mileageKmpl,
            },
            keywords: item.keywords,
          };
        }
      }
      return {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        keywords: item.keywords,
      };
    });

    const systemInstruction = `You are a helpful, expert AI search assistant for "Bike Hub", a premium motorcycle specs, comparison, and marketplace website in Bangladesh.
Your task is to analyze the user's search query and match it against the provided site search index of bikes, categories, spares, and showrooms.
You must return two things in a structured JSON response:
1. "matches": An array containing the IDs of up to 5 items from the search index that best match the query. If no good matches are found, return an empty array.
2. "summary": A conversational, friendly, and expert 1-2 sentence response. Direct the user to the best options, summarize key specs (like price in BDT, engine capacity, features, or location), and explain why they match. If no items match, politely suggest what they can search for instead.`;

    const promptText = `
Search Index (Context):
${JSON.stringify(serializedIndex, null, 2)}

User Search Query:
"${query}"

Find the best matches and write a summary. Follow the requested JSON schema.
`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "string",
              },
              description: "IDs of the items from the search index that match the user query",
            },
            summary: {
              type: "string",
              description: "A friendly, conversational 1-2 sentence description explaining the matches and assisting the user.",
            },
          },
          required: ["matches", "summary"],
        },
      },
    };

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Gemini API Error details:", errorText);
      try {
        const errorJson = JSON.parse(errorText);
        const detailedMessage = errorJson.error?.message || "Failed to communicate with Gemini API.";
        const detailedStatus = errorJson.error?.status || "GEMINI_ERROR";
        return NextResponse.json(
          { error: detailedStatus, message: detailedMessage },
          { status: apiResponse.status }
        );
      } catch {
        return NextResponse.json(
          { error: "Failed to communicate with Gemini API." },
          { status: 502 }
        );
      }
    }

    const data = await apiResponse.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Empty response from Gemini model.");
    }

    const jsonResponse = JSON.parse(rawText);
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in AI search route:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during AI search." },
      { status: 500 }
    );
  }
}
