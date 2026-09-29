# CodeSidekick API

Small FastAPI service for the Chrome extension.

## Run

```bash
cd backend
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Set `OPENAI_API_KEY` in the server environment. The key must never be placed in the extension. OpenAI's current developer guidance likewise recommends keeping API keys server-side rather than exposing them in browser/client code.

Then put:

```
http://localhost:8000
```

in CodeSidekick Settings.

For a hosted deployment, set the extension's Backend URL to the public HTTPS API URL.
