import { MongoClient, ServerApiVersion, type Collection, type Db, type ObjectId } from "mongodb";
import "dotenv/config";

export interface Book {
  _id?: ObjectId;
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  totalCopies: number;
  addedBy: { name: string; email: string };
  createdAt: Date;
}

export interface Borrow {
  _id?: ObjectId;
  bookId: ObjectId;
  bookTitle: string;
  bookImage: string;
  userEmail: string;
  borrowDate: Date;
  returnDate: Date;
}

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is missing in .env");

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let db: Db | null = null;

// Reuse one connection (important on serverless hosts like Vercel)
export async function getDb(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME || "booknook");
  }
  return db;
}

export async function booksCollection(): Promise<Collection<Book>> {
  return (await getDb()).collection<Book>("books");
}

export async function borrowsCollection(): Promise<Collection<Borrow>> {
  return (await getDb()).collection<Borrow>("borrows");
}
