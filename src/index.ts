import express from "express";
import cors from "cors";
import "dotenv/config";
import { getDb } from "./db.js";
import booksRouter from "./routes/books.js";
import borrowsRouter from "./routes/borrows.js";

const app = express();
const port = process.env.PORT || 5000;

// CLIENT_URL can hold several sites, separated by commas (e.g. local + live)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.send({ message: "BookNook server is running" });
});

app.use("/books", booksRouter);
app.use("/borrows", borrowsRouter);

app.use((_req, res) => {
  res.status(404).send({ message: "Route not found" });
});

getDb()
  .then(async (db) => {
    await db.command({ ping: 1 });
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("MongoDB connection failed:", err.message));

// On Vercel the app runs as a serverless function, so it must not open its own port
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`BookNook server listening on port ${port}`);
  });
}

export default app;
