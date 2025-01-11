import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/body", (req, res) => {
  res.render("body");
});

app.get("/mind", (req, res) => {
  res.render("mind");
});

app.get("/sleep", (req, res) => {
  res.render("sleep");
});

app.get("/diet", (req, res) => {
  res.render("diet");
});

// 404 Error handling
app.use((req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1>");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
