<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/17712d28-d4d8-4312-8162-4456dae2d575

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Push this folder to GitHub and import the repo in Vercel (framework: Vite; the
   included `vercel.json` sets the build command and output folder).
2. In **Vercel → Settings → Environment Variables** add:
   - `GEMINI_API_KEY` – for AI marking and past-paper conversion
   - `TEACHER_PASSCODE` – the teacher login passcode (account `teacher@edexcel.org`)
   - `TEACHER_TOKEN_SECRET` – a long random string, e.g. from
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Optional: `FIREBASE_SERVICE_ACCOUNT` – service account JSON (one line), so the
     server uses firebase-admin and you can lock down `firestore.rules`.
3. Redeploy after changing environment variables.

### How it works on Vercel
- All server data (assessments, student sessions, uploaded questions, teacher
  accounts) is stored in Firestore (`server_*` collections), so every serverless
  instance sees the same data. Locally (`npm run dev`) it uses the `data/` folder.
- Large PDFs are uploaded in ~900 KB pieces (`/api/uploads/chunk`) because Vercel
  limits request bodies to 4.5 MB.
- Code answers are run by `api/run_python.py` (Vercel's Node runtime has no Python).
  Written answers are marked against the mark points with Gemini.
