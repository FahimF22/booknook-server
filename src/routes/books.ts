import { Router } from "express";
import { ObjectId, type Filter } from "mongodb";
import { booksCollection, type Book } from "../db.js";
import { verifyToken } from "../middleware/verifyToken.js";

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

// Checks the book form fields. Returns the clean data, or an error message.
export function parseBookInput(body: any): { data?: Omit<Book, "_id" | "addedBy" | "createdAt">; error?: string } {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const data = {
    title: str(body?.title),
    author: str(body?.author),
    category: str(body?.category),
    image: str(body?.image),
    description: str(body?.description),
    totalCopies: Number(body?.totalCopies),
  };
  if (!data.title || !data.author || !data.image || !data.description) {
    return { error: "Title, author, image and description are required" };
  }
  if (!CATEGORIES.includes(data.category)) return { error: "Please choose a valid category" };
  if (!/^https?:\/\//.test(data.image)) return { error: "Image must be a valid URL" };
  if (!Number.isInteger(data.totalCopies) || data.totalCopies < 1) {
    return { error: "Total copies must be a whole number of at least 1" };
  }
  return { data };
}

// GET /books/:id — private
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const id = String(req.params.id);
    if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid book id" });

    const book = await (await booksCollection()).findOne({ _id: new ObjectId(id) });
    if (!book) return res.status(404).send({ message: "Book not found" });
    res.send(book);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to load the book" });
  }
});

// POST /books — private. The owner comes from the token, not the form.
router.post("/", verifyToken, async (req, res) => {
  try {
    const { data, error } = parseBookInput(req.body);
    if (!data) return res.status(400).send({ message: error });

    const book: Book = {
      ...data,
      addedBy: { name: req.user!.name || req.user!.email, email: req.user!.email },
      createdAt: new Date(),
    };
    const result = await (await booksCollection()).insertOne(book);
    res.status(201).send({ ...book, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to add the book" });
  }
});

export default router;
