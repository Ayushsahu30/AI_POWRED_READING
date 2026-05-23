# reading_prototype - Frontend / Backend split

This repository was reorganized to separate the frontend (Vite + React) and the backend (Express API).

Repository layout:

- `frontend/` - Vite React app (sources, public assets, frontend `package.json`).
- `backend/` - Express API server and `.env` for secrets.
- `README.md` - this file (project-level instructions).

Quick start

1) Frontend (development)

```powershell
cd "c:\Users\Ayush\OneDrive\Desktop\Freelancing projects\reading_prototype\frontend"
npm install
npm run dev
```

The frontend expects the API to be available at `http://localhost:4000` by default. You can change the API base URL by setting the `VITE_API_BASE_URL` environment variable.

2) Backend (development)

```powershell
cd "c:\Users\Ayush\OneDrive\Desktop\Freelancing projects\reading_prototype\backend"
npm install
node server.js
```

The backend uses the Gemini API through `@google/genai` and reads `GEMINI_API_KEY` and `PORT` from `backend/.env`.

Security note

- `backend/.env` currently contains an API key copied from the original project; rotate or remove this key if it's sensitive.

Helpful additions you may want me to do next

- Add a root-level `dev` script to run frontend + backend concurrently.
- Update this README with any project-specific docs or endpoints.

Tell me which of the helpful additions you'd like me to implement.
