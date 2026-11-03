import { Router } from "express";
import { MongoServerError, ObjectId } from "mongodb";
import { booksCollection, borrowsCollection, type Borrow } from "../db.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

export const BORROW_DAYS = 7;

// POST /borrows — private. Body: { bookId }
router.post("/", verifyToken, async (req, res) => {
  try {
    const bookId = String(req.body?.bookId ?? "");
    if (!ObjectId.isValid(bookId)) return res.status(400).send({ message: "Invalid book id" });
    const _id = new ObjectId(bookId);
    const userEmail = req.user!.email;

    const books = await booksCollection();
    const borrows = await borrowsCollection();

    if (await borrows.findOne({ bookId: _id, userEmail })) {
      return res.status(409).send({ message: "You have already borrowed this book" });
    }

    // Take one copy only if one is left (check and decrease in a single step)
    const book = await books.findOneAndUpdate(
      { _id, totalCopies: { $gt: 0 } },
      { $inc: { totalCopies: -1 } },
      { returnDocument: "after" }
    );
    if (!book) {
      const exists = await books.countDocuments({ _id });
      return exists
        ? res.status(409).send({ message: "This book is not available right now" })
        : res.status(404).send({ message: "Book not found" });
    }

    const borrowDate = new Date();
    const borrow: Borrow = {
      bookId: _id,
      bookTitle: book.title,
      bookImage: book.image,
      userEmail,
      borrowDate,
      returnDate: new Date(borrowDate.getTime() + BORROW_DAYS * 24 * 60 * 60 * 1000),
    };

    try {
      const result = await borrows.insertOne(borrow);
      res.status(201).send({ ...borrow, _id: result.insertedId, availableCopies: book.totalCopies });
    } catch (err) {
      // Put the copy back if the borrow could not be saved
      await books.updateOne({ _id }, { $inc: { totalCopies: 1 } });
      if (err instanceof MongoServerError && err.code === 11000) {
        return res.status(409).send({ message: "You have already borrowed this book" });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to borrow the book" });
  }
});

export default router;
