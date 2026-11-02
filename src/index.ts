import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:3000").split(","),
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.send({ message: "BookNook server is running" });
});

app.listen(port, () => {
  console.log(`BookNook server listening on port ${port}`);
});

export default app;
