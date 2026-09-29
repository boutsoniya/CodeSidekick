import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="CodeSidekick API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CoachRequest(BaseModel):
    mode: str
    problem: str
    code: str = ""
    language: str = "Python"

MODE_INSTRUCTIONS = {
    "hint": "Give one useful hint only. Do not reveal the complete solution. Encourage the learner to reason.",
    "approach": "Explain the algorithmic approach step-by-step before giving code. Do not dump a complete solution unless explicitly requested.",
    "debug": "Review the submitted code for correctness, edge cases, bugs, and likely failure cases. Be specific and educational.",
    "complexity": "Analyze the submitted code or proposed approach and explain time and auxiliary-space complexity. Point to the operations that determine the complexity.",
}

@app.get("/health")
def health():
    return {"status": "ok", "service": "codesidekick"}

@app.post("/coach")
async def coach(req: CoachRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(503, "OPENAI_API_KEY is not configured on the server.")

    instruction = MODE_INSTRUCTIONS.get(req.mode, MODE_INSTRUCTIONS["hint"])
    model = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")
    prompt = f"""You are CodeSidekick, a patient coding interview coach.
Your job is to help a learner understand and solve programming problems.
{instruction}

Problem:
{req.problem}

Language:
{req.language}

Learner's code:
{req.code or "(none)"}

Keep the response concise, concrete, and easy to act on. Avoid pretending to execute code you did not execute."""

    payload = {
        "model": model,
        "input": prompt,
    }

    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            "https://api.openai.com/v1/responses",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(response.status_code, response.text)

    data = response.json()
    answer = data.get("output_text")
    if not answer:
        # Defensive fallback for compatible Responses-style providers.
        chunks = []
        for item in data.get("output", []):
            for content in item.get("content", []):
                if content.get("type") == "output_text":
                    chunks.append(content.get("text", ""))
        answer = "\n".join(chunks).strip()

    return {"answer": answer or "The model returned no text."}
