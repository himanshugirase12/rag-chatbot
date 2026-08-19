# RAG AI — Chat With Your Documents

A full-stack MERN application that lets users upload documents (PDF, DOCX, TXT) and ask questions about them, with answers grounded in the actual document content and backed by source citations. Built as a second portfolio project to demonstrate practical AI/LLM integration skills beyond a standard CRUD app.

**Live app:** https://rag-chatbot-pearl-two.vercel.app
**Backend API:** https://rag-ai-j5tz.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take 30–50 seconds while the server wakes up — this is a hosting limitation, not an application bug.

---

## Why this project

Most student MERN portfolios lean on the same handful of CRUD patterns. This project was built to show a different, currently in-demand skill set: retrieval-augmented generation (RAG), vector search, and integrating a real LLM into a production-shaped app — including the parts that are usually skipped in tutorials, like honest "I don't know" handling, usage-based billing logic, and real payment integration.

---

## Key features

- **Document upload & ingestion** — PDF/DOCX/TXT parsing, automatic chunking, and embedding generation on upload
- **Semantic search, not keyword search** — questions are matched to document content by meaning, using vector similarity
- **Source citations on every grounded answer** — each answer links back to the exact chunk(s) it came from, with a similarity score
- **Honest fallback behavior** — if a question can't be answered from the uploaded documents, the assistant either says so, or clearly labels a general-knowledge answer as ungrounded rather than pretending it came from the user's files
- **Persistent conversations** — full chat history is saved per user and can be revisited later
- **Freemium usage limits** — free accounts get 10 questions and 10 document uploads per day, with a daily reset and a real upgrade path
- **Real payments** — Razorpay integration (test mode) for upgrading to the Pro plan, with signature verification so a client-side claim of "payment succeeded" is never trusted on its own
- **Full account management** — edit profile, change password, delete account (with cascading deletion of all associated data)

---

## Architecture

**Ingestion pipeline** (runs once per uploaded document):
```
Upload → Parse text → Chunk (with overlap) → Generate embeddings → Store in vector index
```

**Query pipeline** (runs per question):
```
Embed question → Vector search (filtered per user) → Build context-augmented prompt → Generate answer → Return with citations
```

Documents are stored in Cloudinary. Extracted chunks and their embeddings are stored in MongoDB Atlas, which also provides the vector search index used for retrieval — no separate vector database service was needed.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (including Atlas Vector Search) |
| File storage | Cloudinary |
| LLM / Embeddings | Google Gemini (`gemini-embedding-001`, `gemini-3.5-flash-lite`) |
| Payments | Razorpay (test mode) |
| Auth | JWT, bcrypt |
| Deployment | Render (backend), Vercel (frontend) |

---

## Local setup

**Backend**
```bash
cd backend
npm install
```
Create `backend/.env`:
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=5000
```
```bash
npm start
```

**Frontend**
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```
```bash
npm run dev
```

You'll also need an Atlas Vector Search index named `vector_index` on the `chunks` collection, with a `vector` field on `embedding` (3072 dimensions, cosine similarity) and a `filter` field on `owner`.

---

## Known limitations

- **Scanned/image-only PDFs are not supported.** Text extraction relies on the PDF containing real, selectable text; scanned documents would need OCR (not currently implemented) and are marked `failed` rather than silently producing empty results.
- **Payments are in test mode.** Razorpay is integrated for real, with proper signature verification, but no live transactions are processed — this is a portfolio demo, not a production billing system.
- **Free-tier hosting cold starts.** The backend (Render free tier) and the Gemini API's free tier both have rate/availability constraints appropriate for a demo, not production traffic.
- **No OCR, no multi-language support beyond what Gemini's models natively handle.**

---

## Evaluation

To sanity-check retrieval quality, the assistant was tested against a mix of factual and out-of-scope questions on uploaded reference documents (a DSA interview guide and an HTML cheatsheet):

| Question type | Example | Result |
|---|---|---|
| In-document factual | "How do you solve the Two Sum problem?" | Correctly grounded, cited source with ~92% match score |
| In-document, subjective phrasing | "Which project looks good for selection?" | Correctly summarized relevant facts from context rather than refusing outright |
| Out-of-scope | "What is the capital of France?" | Correctly identified as outside the documents, clearly labeled general-knowledge fallback answer |
| No relevant match in DB | Question asked before any document was uploaded | Correctly declined rather than hallucinating an answer |

This behavior — refusing to fabricate answers, and clearly labeling when it falls back to general knowledge — was a deliberate design choice, not a default. It required an explicit instruction to the LLM to admit uncertainty, and was verified to work correctly in both the "no answer" and "found irrelevant chunks" cases during development.

---

## Author

Himanshu Girase