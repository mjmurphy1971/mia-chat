import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages = Array.isArray(body?.messages) ? body.messages : [];

    // Prefer the most recent USER message (safer than assuming last item is user)
    const lastUserMsg = [...messages]
      .reverse()
      .find((m: any) => (m?.role || "").toLowerCase() === "user");

    const lastUserText = (lastUserMsg?.content ?? "")
      .toString()
      .toLowerCase()
      .trim();

    // Env
    const schedulingLink = process.env.SCHEDULING_LINK_15_MIN;
    const resumePdfUrl = process.env.RESUME_PDF_URL;

    const systemPrompt =
      process.env.MIA_SYSTEM_PROMPT ??
      "You are Mia, Mary Murphy's practical, warm, slightly skeptical professional assistant. Be concise and action-oriented.";

    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    // 0) Resume intent (fast-path)
    if (
      resumePdfUrl &&
      (lastUserText.includes("resume") ||
        lastUserText.includes("cv") ||
        lastUserText.includes("pdf") ||
        lastUserText.includes("download") ||
        lastUserText.includes("printed copy") ||
        lastUserText.includes("print"))
    ) {
      return NextResponse.json({
        reply: `You can download Mary’s resume here (PDF): ${resumePdfUrl}`,
      });
    }

    // 1) Scheduling intent (fast-path)
    if (
      schedulingLink &&
      (lastUserText.includes("schedule") || lastUserText.includes("scheduling"))
    ) {
      return NextResponse.json({
        reply: `You can schedule time with Mary here: ${schedulingLink}`,
      });
    }

    // --- LinkedIn refinement loop (C.2 Option 2) ---

    const isLinkedInIntent =
      lastUserText.includes("linkedin") ||
      lastUserText.includes("post") ||
      lastUserText.includes("thought leadership");

    const isRefineIntent =
      lastUserText.includes("shorter") ||
      lastUserText.includes("shorten") ||
      lastUserText.includes("punchier") ||
      lastUserText.includes("bolder") ||
      lastUserText.includes("more executive") ||
      lastUserText.includes("more senior") ||
      lastUserText.includes("tighten") ||
      lastUserText.includes("rewrite") ||
      lastUserText.includes("revise") ||
      lastUserText.includes("edit") ||
      lastUserText.includes("improve") ||
      lastUserText.includes("variants") ||
      lastUserText.includes("3 versions") ||
      lastUserText.includes("three versions");

    // Grab the most recent assistant message as the "draft" if present
    const lastAssistantText = [...messages]
      .reverse()
      .find((m: any) => (m?.role || "").toLowerCase() === "assistant")
      ?.content;

    // If user is asking to refine but we don't have a draft, ask for it
    if (isRefineIntent && !lastAssistantText) {
      return NextResponse.json({
        reply:
          "Sure — paste the LinkedIn draft you want to refine, and tell me ONE preference: (1) shorter, (2) more executive, or (3) 3 variants.",
      });
    }

    // If user is asking to refine a LinkedIn post, rewrite the last assistant draft
    if (isLinkedInIntent && isRefineIntent && lastAssistantText) {
      const refinePrompt = `
You are Mia, Mary Murphy’s practical, warm, slightly skeptical professional assistant.

TASK:
Rewrite the LinkedIn post draft below based on the user's request.

RULES:
- Keep it LinkedIn-ready
- Keep the core meaning
- Make it clean, concise, and scannable
- Add 3–6 relevant hashtags at the end
- Do not invent metrics or claims

USER REQUEST:
"${lastUserText}"

DRAFT TO REFINE:
"""${lastAssistantText}"""
      `.trim();

      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.6,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: refinePrompt },
        ],
      });

      const revised =
        completion.choices?.[0]?.message?.content?.trim() || "(No reply)";

      return NextResponse.json({ reply: revised });
    }

    // If they want LinkedIn help/refinement, use a focused prompt
    if (isLinkedInIntent || isRefineIntent) {
      const refineInstruction = isRefineIntent
        ? `Refinement request from user: "${lastUserText}".`
        : `Create a new LinkedIn post based on user request: "${lastUserText}".`;

      const draftContext = lastAssistantText
        ? `Here is the current draft to refine:\n\n${lastAssistantText}\n\n`
        : "";

      const userMsg = `${draftContext}${refineInstruction}

Rules:
- Keep it professional and readable (no hype).
- Use short paragraphs.
- End with a gentle question or CTA.
- Avoid excessive emojis (0–2 max).
- If user asked for "3 variants", return 3 clearly labeled options.`;

      try {
        const result = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMsg },
          ],
          temperature: 0.7,
        });

        const text =
          result.choices?.[0]?.message?.content?.trim() ||
          "I didn’t get a response back—try again.";

        return NextResponse.json({ reply: text });
      } catch (e: any) {
        return NextResponse.json(
          { error: "OpenAI call failed", details: e?.message || String(e) },
          { status: 500 }
        );
      }
    }

    // --- end LinkedIn refinement loop ---

    // 2) AI response (everything else)
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        // pass through the conversation from the UI
        ...messages.map((m: any) => ({
          role: (m?.role || "").toLowerCase() === "assistant" ? "assistant" : "user",
          content: (m?.content ?? "").toString(),
        })),
      ],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "(No reply)";

    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process request", details: err?.message },
      { status: 500 }
    );
  }
}
