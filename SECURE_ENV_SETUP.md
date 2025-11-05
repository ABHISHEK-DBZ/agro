Secure environment & deployment setup

This project previously contained hard-coded Google Gemini API keys in a few tracked files. To keep secrets safe, follow these steps.

1) Local development
- Keep your local `.env` with your keys, but do NOT commit it. Ensure `.env` is listed in `.gitignore`.
- Example variables (copy into `.env`):

VITE_GEMINI_API_KEY=your_real_api_key_here
GEMINI_API_KEY=your_real_api_key_here

2) Vercel (recommended for frontend + serverless APIs)
- Go to your Vercel project dashboard → Settings → Environment Variables.
- Add `VITE_GEMINI_API_KEY` and `GEMINI_API_KEY` with the correct values.
  - Set the appropriate Environment (Production/Preview/Development).
  - Mark values as "Encrypted"/"Protected" if the dashboard supports it.
- Remove any hard-coded keys from `vercel.json` in repo; the platform will inject variables at build/runtime.

3) Render (if you use it)
- In Render dashboard, navigate to your Service → Environment → Environment Variables.
- Add `GEMINI_API_KEY` and `VITE_GEMINI_API_KEY` as secure environment variables.
- In `render.yaml` keep `sync: false` (or remove the `value` entry) so secrets are not stored in the repo.

4) CI / Docker / Other platforms
- For Docker Compose, ensure you use environment expansion from host or CI secret store (e.g., `GEMINI_API_KEY=${GEMINI_API_KEY}`) and avoid checking `.env` into source control.

5) Optional: Remove secrets from git history (advanced)
- If keys were committed previously and you want to purge them, use tools like `git filter-repo` or `bfg` to remove secrets from history. Be careful: rewriting history is destructive for shared repos.

6) Quick checklist (before merging):
- [. ] `vercel.json` contains no secret values
- [. ] `render.yaml` contains no secret values (use `sync: false` or remove `value`)
- [. ] `.env.example` contains placeholders, not real keys
- [. ] Add docs (this file) explaining how to set secrets on hosting platforms

If you want, I can:
- Remove the key from the tracked `.env` file in this repo (replace it with a placeholder),
- Remove keys from other tracked files and push a commit that removes them, and
- Add a short script or PR message template to help you set the environment variables on Vercel/Render.

Tell me if you'd like me to proceed with removing the key from the tracked `.env` as well (I will replace it with placeholders).