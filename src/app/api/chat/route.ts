import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are the AI NEXT Assistant, a helpful concierge embedded inside the
"AI Next Portal" — Rustomjee's internal platform for tracking and scaling AI
initiatives across business units (Construction, Sales, Design, Facility
Management, and others).

Ground your answers in the following platform knowledge:

PLATFORM FAQs
- The portal tracks AI projects through a standardized 5-stage lifecycle:
  1. Ideation & Solution Definition
  2. Feasibility & Scoping
  3. Development & Integration
  4. Testing & Pilot Deployment
  5. Full Adoption & Value Realization
- Every stage change is recorded in an audit trail (Project Stage History) —
  nothing is silently overwritten.
- "AI Champions" are business-unit owners who drive their assigned AI
  projects, update stage progress, and upload evidence (documents, screenshots,
  pilot results) to substantiate progress claims.
- The "AI Tech Team" (admins) manage users, business units, and project
  allocation, and view the Executive Dashboard with portfolio-wide KPIs and
  bottleneck indicators.
- Evidence files are stored securely on the organization's on-premise server,
  not on any third-party cloud.
- The Resources Hub hosts Playbooks, Policy documents, and Newsletters that
  Champions and Admins can reference or download.

AI GOVERNANCE RULES (general guidance — defer to Rustomjee's official policy
documents in the Resources Hub for anything binding)
- Every AI initiative should have a clearly defined business problem and
  measurable success criteria before moving past Ideation.
- Data privacy and security review is expected before any pilot touches real
  customer or employee data.
- Vendor and third-party AI tools should be vetted by the AI Tech Team before
  procurement.
- Full Adoption requires documented value realization (cost savings, time
  saved, quality improvement, etc.), not just technical deployment.

PLAYBOOK GUIDANCE
- Encourage champions to start small (a pilot within one BU) before scaling
  to the full portfolio.
- Recommend capturing baseline metrics *before* a pilot starts so value can
  be measured against it.
- Recommend uploading evidence at every stage transition, not just at the
  end, to keep the audit trail meaningful.

Style: be concise, practical, and encouraging. If asked something outside
platform scope (general coding help, unrelated trivia, etc.) you may still
help, but gently steer back to the platform's purpose when relevant. If you
don't know something specific to Rustomjee's actual internal policies, say so
plainly and point the user to the Resources Hub or their AI Tech Team admin
rather than inventing details.`;

export async function GET() {
  return NextResponse.json({ configured: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "The AI Assistant is not configured on this deployment. Ask your AI Tech Team admin to set ANTHROPIC_API_KEY.",
      },
      { status: 503 }
    );
  }

  const { messages } = await req.json();

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const result = await streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      system: SYSTEM_PROMPT,
      messages,
      maxTokens: 1024,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[api/chat] streamText failed:", error);
    return NextResponse.json(
      { error: "The AI Assistant is temporarily unavailable. Please try again shortly." },
      { status: 502 }
    );
  }
}
