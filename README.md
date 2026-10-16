# Express API interview starter

Small REST API template with Node.js, Express 5, Zod validation, Nodemon and Node's built-in test runner. Posts live in memory so the template starts without a database; add a database only if the prompt asks for persistence.

## Requirements

- Node.js 20+
- npm

## Run

```bash
npm install
npm run dev
```

API listens on `http://localhost:3000` (override with `PORT`). Health check: `GET /health`.

## Endpoints

```text
GET     /api/posts
POST    /api/posts       {"title":"First post","body":"Hello"}
GET     /api/posts/1
PATCH   /api/posts/1     {"title":"Updated title"}
DELETE  /api/posts/1
```

Invalid input returns `422`; a missing post returns `404`. Run the CRUD/validation tests with `npm test`.

## Structure

- `src/app.js`: middleware, routes, validation and JSON error handling
- `src/server.js`: HTTP listener and port configuration
- `tests/posts.test.js`: endpoint and validation tests using Node's built-in test runner

The in-memory store resets when the server restarts. For a prompt that requires SQL, replace the array with a repository/database layer and document the connection string in a local `.env` (never commit secrets).
