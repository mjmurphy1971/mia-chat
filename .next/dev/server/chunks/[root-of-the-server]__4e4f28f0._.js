module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
;
;
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
async function POST(req) {
    try {
        const body = await req.json();
        const messages = Array.isArray(body?.messages) ? body.messages : [];
        // Prefer the most recent USER message (safer than assuming last item is user)
        const lastUserMsg = [
            ...messages
        ].reverse().find((m)=>(m?.role || "").toLowerCase() === "user");
        const lastUserText = (lastUserMsg?.content ?? "").toString().toLowerCase().trim();
        // Env
        const schedulingLink = process.env.SCHEDULING_LINK_15_MIN;
        const resumePdfUrl = process.env.RESUME_PDF_URL;
        const systemPrompt = process.env.MIA_SYSTEM_PROMPT ?? "You are Mia, Mary Murphy's practical, warm, slightly skeptical professional assistant. Be concise and action-oriented.";
        const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
        // 0) Resume intent (fast-path)
        if (resumePdfUrl && (lastUserText.includes("resume") || lastUserText.includes("cv") || lastUserText.includes("pdf") || lastUserText.includes("download") || lastUserText.includes("printed copy") || lastUserText.includes("print"))) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                reply: `You can download Mary’s resume here (PDF): ${resumePdfUrl}`
            });
        }
        // 1) Scheduling intent (fast-path)
        if (schedulingLink && (lastUserText.includes("schedule") || lastUserText.includes("scheduling"))) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                reply: `You can schedule time with Mary here: ${schedulingLink}`
            });
        }
        // --- LinkedIn refinement loop (C.2 Option 2) ---
        const isLinkedInIntent = lastUserText.includes("linkedin") || lastUserText.includes("post") || lastUserText.includes("thought leadership");
        const isRefineIntent = lastUserText.includes("shorter") || lastUserText.includes("shorten") || lastUserText.includes("punchier") || lastUserText.includes("bolder") || lastUserText.includes("more executive") || lastUserText.includes("more senior") || lastUserText.includes("tighten") || lastUserText.includes("rewrite") || lastUserText.includes("revise") || lastUserText.includes("edit") || lastUserText.includes("improve") || lastUserText.includes("variants") || lastUserText.includes("3 versions") || lastUserText.includes("three versions");
        // Grab the most recent assistant message as the "draft" if present
        const lastAssistantText = [
            ...messages
        ].reverse().find((m)=>(m?.role || "").toLowerCase() === "assistant")?.content;
        // If user is asking to refine but we don't have a draft, ask for it
        if (isRefineIntent && !lastAssistantText) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                reply: "Sure — paste the LinkedIn draft you want to refine, and tell me ONE preference: (1) shorter, (2) more executive, or (3) 3 variants."
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
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: refinePrompt
                    }
                ]
            });
            const revised = completion.choices?.[0]?.message?.content?.trim() || "(No reply)";
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                reply: revised
            });
        }
        // If they want LinkedIn help/refinement, use a focused prompt
        if (isLinkedInIntent || isRefineIntent) {
            const refineInstruction = isRefineIntent ? `Refinement request from user: "${lastUserText}".` : `Create a new LinkedIn post based on user request: "${lastUserText}".`;
            const draftContext = lastAssistantText ? `Here is the current draft to refine:\n\n${lastAssistantText}\n\n` : "";
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
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: userMsg
                        }
                    ],
                    temperature: 0.7
                });
                const text = result.choices?.[0]?.message?.content?.trim() || "I didn’t get a response back—try again.";
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    reply: text
                });
            } catch (e) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "OpenAI call failed",
                    details: e?.message || String(e)
                }, {
                    status: 500
                });
            }
        }
        // --- end LinkedIn refinement loop ---
        // 2) AI response (everything else)
        if (!process.env.OPENAI_API_KEY) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing OPENAI_API_KEY in .env.local"
            }, {
                status: 500
            });
        }
        const completion = await openai.chat.completions.create({
            model,
            temperature: 0.7,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                // pass through the conversation from the UI
                ...messages.map((m)=>({
                        role: (m?.role || "").toLowerCase() === "assistant" ? "assistant" : "user",
                        content: (m?.content ?? "").toString()
                    }))
            ]
        });
        const reply = completion.choices?.[0]?.message?.content?.trim() || "(No reply)";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            reply
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to process request",
            details: err?.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4e4f28f0._.js.map