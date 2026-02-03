import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function loadSystemPrompt() {
  const promptPath = path.join(process.cwd(), "SYSTEM_PROMPT.md");
  return fs.readFileSync(promptPath, "utf8");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json(
        { error: "No message provided." },
        { status: 400 }
      );
    }

    const systemPrompt = loadSystemPrompt();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error: any) {
    console.error("Mia API error FULL:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
