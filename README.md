# BookNook Server

The Express + MongoDB API for **BookNook**, a small online library where readers add, borrow and return books.

**Live API:** https://booknook-server-lyart.vercel.app

**Live site:** https://booknook-client-p3li.vercel.app

**Client repo:** https://github.com/FahimF22/booknook-client

## Features

- REST API for books and borrows, stored in MongoDB
- Private routes protected with JWT: tokens are issued by BetterAuth in the Next.js client and checked here against its public keys (JWKS)
- Book owners are taken from the token, so users can only edit or delete their own books
- Borrowing lowers the available copies with `$inc` and returning raises them again. The check and the change happen in one step, so two readers can't take the last copy.
- A user can't borrow the same book twice at the same time (checked in code and by a unique index)
- Books that are currently borrowed can't be deleted
- Seed script with 15 sample books

## API

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/books` | Public | All books, newest first. Optional `?limit=6`, `?email=`, `?category=` |
| GET | `/books/:id` | JWT | One book |
| POST | `/books` | JWT | Add a book |
| PATCH | `/books/:id` | JWT, owner | Update a book |
| DELETE | `/books/:id` | JWT, owner | Delete a book |
| POST | `/borrows` | JWT | Borrow a book (`{ bookId }`), returns in 7 days |
| GET | `/borrows` | JWT | The logged-in user's borrows |
| DELETE | `/borrows/:id` | JWT, borrower | Return a book |

## Run locally

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:5000
npm run seed           # optional: add sample books
```

### Environment variables

| Name | Example | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `DB_NAME` | `booknook` | Database name (same one the client uses) |
| `CLIENT_URL` | `http://localhost:3000,https://your-site.vercel.app` | Sites allowed by CORS (comma separated) |
| `AUTH_URL` | `https://your-site.vercel.app` | The client's address; tokens are checked against `AUTH_URL/api/auth/jwks` |
| `PORT` | `5000` | Local port (not used on Vercel) |

## Deploy

- **Vercel:** import the repo; `vercel.json` builds the TypeScript and serves it from `api/index.js`. Add the environment variables in the project settings.
- **Render:** build command `npm install && npm run build`, start command `npm start`.

## Tech

Express 5, MongoDB Node driver, jose (JWT), TypeScript
