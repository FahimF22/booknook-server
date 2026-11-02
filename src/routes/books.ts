import { Router } from "express";
import type { Filter } from "mongodb";
import { booksCollection, type Book } from "../db.js";

const router = Router();

export const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"];

// GET /books — public
// Optional query: ?limit=6 (New Arrivals), ?email= (books added by a user), ?category=
router.get("/", async (req, res) => {
  try {
    const { email, category } = req.query;
    const filter: Filter<Book> = {};
    if (typeof email === "string" && email) filter["addedBy.email"] = email;
    if (typeof category === "string" && CATEGORIES.includes(category)) filter.category = category;

    const limit = Number(req.query.limit);
    let cursor = (await booksCollection()).find(filter).sort({ createdAt: -1 });
    if (Number.isInteger(limit) && limit > 0) cursor = cursor.limit(limit);

    res.send(await cursor.toArray());
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to load books" });
  }
});

export default router;
