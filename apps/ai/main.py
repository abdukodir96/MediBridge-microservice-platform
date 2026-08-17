import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

load_dotenv()

from google import genai  # noqa: E402  (must run after load_dotenv)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

app = FastAPI(title="MediBridge AI Service")

LANG_NAMES = {
    "EN": "English",
    "ZH": "Chinese",
    "JA": "Japanese",
    "KO": "Korean",
}

TargetLang = Literal["EN", "ZH", "JA", "KO"]


class TranslateRequest(BaseModel):
    text: str
    targetLang: TargetLang


class TranslateResponse(BaseModel):
    translatedText: str


@app.get("/health")
def health():
    return {"status": "ok", "configured": bool(GEMINI_API_KEY)}


# Chat calls this best-effort and fire-and-forget after a message is already
# sent — a failure here (missing key, Gemini downtime, bad input) must never
# block message delivery, so it's a plain HTTP error the caller is expected
# to swallow, not something this service tries to work around internally.
@app.post("/translate", response_model=TranslateResponse)
def translate(req: TranslateRequest):
    if not client:
        raise HTTPException(status_code=503, detail="AI service not configured (GEMINI_API_KEY missing)")

    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text must not be empty")

    target_name = LANG_NAMES[req.targetLang]
    prompt = (
        f"Translate the following chat message into {target_name}. "
        "Reply with ONLY the translated text — no explanation, no quotes, "
        "no language name.\n\n"
        f"{text}"
    )

    try:
        result = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        translated = (result.text or "").strip()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Translation failed: {exc}")

    if not translated:
        raise HTTPException(status_code=502, detail="Translation returned empty text")

    return TranslateResponse(translatedText=translated)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)
