// Loads sample books so the site has something to show.
// Run: npm run seed            (books added by "BookNook Team")
//      npm run seed -- you@mail.com "Your Name"   (books owned by your account)
import "dotenv/config";
import { booksCollection, getDb, type Book } from "./db.js";

const cover = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

const samples: Omit<Book, "addedBy" | "createdAt">[] = [
  { title: "Pride and Prejudice", author: "Jane Austen", category: "Fiction", image: cover("9780141439518"), totalCopies: 3,
    description: "Elizabeth Bennet trades sharp words with the proud Mr. Darcy in a witty story about first impressions, family and love in Regency England." },
  { title: "Nineteen Eighty-Four", author: "George Orwell", category: "Fiction", image: cover("9780451524935"), totalCopies: 2,
    description: "Winston Smith quietly rebels against a state that watches every move and rewrites the past. A chilling classic about truth and freedom." },
  { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", image: cover("9780061120084"), totalCopies: 4,
    description: "Through young Scout's eyes, a small Alabama town faces prejudice when her father defends a Black man wrongly accused of a crime." },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", image: cover("9780743273565"), totalCopies: 1,
    description: "The mysterious Jay Gatsby throws lavish parties on Long Island, all in the hope of winning back the woman he loves." },
  { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", image: cover("9780553380163"), totalCopies: 2,
    description: "From the Big Bang to black holes, Hawking explains the biggest questions about space and time in clear, friendly language." },
  { title: "Cosmos", author: "Carl Sagan", category: "Science", image: cover("9780345539434"), totalCopies: 3,
    description: "A warm, wonder-filled tour of the universe and of how science helped humanity understand its place among the stars." },
  { title: "The Selfish Gene", author: "Richard Dawkins", category: "Science", image: cover("9780198788607"), totalCopies: 1,
    description: "A gene's-eye view of evolution that explains why living things behave the way they do, from cooperation to competition." },
  { title: "Sapiens", author: "Yuval Noah Harari", category: "History", image: cover("9780062316097"), totalCopies: 5,
    description: "How did one species of ape come to rule the planet? A sweeping look at 70,000 years of human history, from hunters to the digital age." },
  { title: "Guns, Germs, and Steel", author: "Jared Diamond", category: "History", image: cover("9780393354324"), totalCopies: 2,
    description: "Why did some societies conquer others? Diamond traces the answer to geography, farming, animals and the spread of disease." },
  { title: "The Diary of a Young Girl", author: "Anne Frank", category: "History", image: cover("9780553296983"), totalCopies: 3,
    description: "The honest, hopeful diary Anne Frank kept while hiding with her family from the Nazis in Amsterdam during the Second World War." },
  { title: "Charlotte's Web", author: "E. B. White", category: "Kids", image: cover("9780061124952"), totalCopies: 4,
    description: "A clever spider named Charlotte sets out to save her friend Wilbur the pig, in a gentle story about friendship and growing up." },
  { title: "The Little Prince", author: "Antoine de Saint-Exupéry", category: "Kids", image: cover("9780156012195"), totalCopies: 2,
    description: "A pilot stranded in the desert meets a little prince from a tiny planet, and learns what truly matters in life." },
  { title: "Matilda", author: "Roald Dahl", category: "Kids", image: cover("9780142410370"), totalCopies: 3,
    description: "Bookish, brilliant Matilda discovers she has special powers, and uses them to stand up to the terrible headmistress Miss Trunchbull." },
  { title: "Atomic Habits", author: "James Clear", category: "Others", image: cover("9780735211292"), totalCopies: 2,
    description: "Small changes, big results. A practical guide to building good habits, breaking bad ones and getting a little better every day." },
  { title: "The Art of War", author: "Sun Tzu", category: "Others", image: cover("9781599869773"), totalCopies: 1,
    description: "An ancient Chinese guide to strategy whose lessons on planning, timing and knowing yourself are still read by leaders today." },
];

async function seed() {
  const [email = "team@booknook.app", name = "BookNook Team"] = process.argv.slice(2);
  const books = await booksCollection();
  const now = Date.now();
  let added = 0;

  for (const [i, sample] of samples.entries()) {
    // Skip books that are already there, so the script is safe to run twice
    const exists = await books.findOne({ title: sample.title, author: sample.author });
    if (exists) continue;
    await books.insertOne({
      ...sample,
      addedBy: { name, email },
      // Space the dates out so "newest first" has a clear order
      createdAt: new Date(now - (samples.length - i) * 60 * 60 * 1000),
    });
    added++;
  }

  console.log(`Seed done: ${added} added, ${samples.length - added} already there (owner: ${email})`);
  (await getDb()).client.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
