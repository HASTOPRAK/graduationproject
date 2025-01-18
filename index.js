import express from "express";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import Activity from "./models/Activity.js";
import User from "./models/User.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Middleware (JWT)
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send("Invalid token.");
  }
};

console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Database connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.render("index", { user: null });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(decoded.id).then((user) => {
      if (!user) {
        return res.render("index", { user: null });
      }
      res.render("index", { user });
    });
  } catch (err) {
    res.render("index", { user: null });
  }
});

app.get("/body", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const bodyXp = user.xpBreakdown.body || 0;
    res.render("body", { xp: bodyXp });
  } catch (err) {
    res.status(500).send("Error fetching user data: " + err.message);
  }
});

app.get("/mind", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const mindXp = user.xpBreakdown.mind || 0;
    res.render("mind", { xp: mindXp });
  } catch (err) {
    res.status(500).send("Error fetching user data: " + err.message);
  }
});

app.get("/sleep", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const sleepXp = user.xpBreakdown.sleep || 0;
    res.render("sleep", { xp: sleepXp });
  } catch (err) {
    res.status(500).send("Error fetching user data: " + err.message);
  }
});

app.get("/diet", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const dietXp = user.xpBreakdown.diet || 0;
    res.render("diet", { xp: dietXp });
  } catch (err) {
    res.status(500).send("Error fetching user data: " + err.message);
  }
});

app.get("/progress", authMiddleware, async (req, res) => {
  try {
    const userId = req.query.userId;

    // If userId is provided in the query, allow public access
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (req.user) {
      // If no userId but user is authenticated
      user = await User.findById(req.user.id);
    }
    if (!user) {
      return res.status(404).send("User not found.");
    }

    res.render("progress", {
      username: user.username,
      user: req.user,
      userId: req.user.id,
      request: req,
      user,
      xpBreakdown: user.xpBreakdown,
      totalXp: user.totalXp,
      streak: user.streak,
    });
  } catch (err) {
    res.status(500).send("Error loading progress page: " + err.message);
  }
});

app.get("/share/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    res.render("sharedProgress", {
      username: user.username,
      xpBreakdown: user.xpBreakdown,
      streak: user.streak,
      totalXp: user.totalXp,
    });
  } catch (err) {
    res.status(500).send("Error fetching user progress: " + err.message);
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});
//REGISTER POST
app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();
    res.redirect("/login");
    res.status(201).send("User registered successfully!");
  } catch (err) {
    res.status(500).send("Error registering user: " + err.message);
  }
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login");
});

//LOGIN POST
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Email does not exist
      return res.status(401).send("Invalid email.");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Password is incorrect
      return res.status(401).send("Invalid password.");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error logging in: " + err.message);
  }
});

app.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();
    const lastActivityDate = user.activities.length
      ? new Date(user.activities[user.activities.length - 1].date)
      : null;

    // Reset streak
    if (!lastActivityDate || now - lastActivityDate > 24 * 60 * 60 * 1000) {
      user.streak = 0;
      await user.save();
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user data: " + err.message });
  }
});

// Logout User
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

//STEPS TO TAKE
app.get("/activities/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const activities = await Activity.find({ category }).sort({ tier: 1 });
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).send("Error fetching activities: " + err.message);
  }
});

//ADDING TO DAILY
app.post("/add-activity", authMiddleware, async (req, res) => {
  const { activityId } = req.body;

  if (!activityId) {
    return res.status(400).send("Activity ID is required.");
  }

  try {
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).send("Activity not found.");
    }

    const user = await User.findById(req.user.id);

    user.dailyActivities.push({
      activityId: activity._id,
      description: activity.description,
      xp: activity.xp,
      category: activity.category,
      completed: false,
    });

    await user.save();
    res.status(200).send("Activity added to daily list.");
  } catch (err) {
    res.status(500).send("Error adding activity: " + err.message);
  }
});

//POSTING ACTIVITIES
app.post("/complete-activity", authMiddleware, async (req, res) => {
  const { activityIds } = req.body;
  if (
    !Array.isArray(activityIds) ||
    activityIds.some((id) => typeof id !== "string")
  ) {
    return res.status(400).send("Invalid activity IDs format.");
  }

  if (!activityIds || activityIds.length === 0) {
    return res.status(400).send("No activities selected.");
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User not found.");
    }
    let totalXpEarned = 0;

    user.dailyActivities = user.dailyActivities.filter((activity) => {
      if (
        activityIds.includes(activity.activityId.toString()) &&
        !activity.completed
      ) {
        totalXpEarned += activity.xp;

        /// Update XP in xpBreakdown
        const activityCategory = activity.category || "unknown";
        if (user.xpBreakdown[activityCategory] !== undefined) {
          user.xpBreakdown[activityCategory] += activity.xp;
        }

        return false;
      }
      return true;
    });

    user.totalXp += totalXpEarned;

    // Increment streak only once per day
    const now = new Date();
    const lastActivityDate = user.activities.length
      ? new Date(user.activities[user.activities.length - 1].date)
      : null;

    if (!lastActivityDate || now - lastActivityDate > 24 * 60 * 60 * 1000) {
      user.streak += 1;
    }

    user.activities.push(
      ...activityIds.map((activityId) => {
        const matchedActivity = user.dailyActivities.find(
          (act) => act.activityId.toString() === activityId
        );

        return {
          activityId,
          date: now,
          xp: matchedActivity?.xp || 0,
          category: matchedActivity?.category || "unknown",
        };
      })
    );

    await user.save();

    res.status(200).json({
      message: "Activities completed.",
      totalXp: user.totalXp,
      streak: user.streak,
      xpBreakdown: user.xpBreakdown,
    });
  } catch (err) {
    res.status(500).send("Error completing activities: " + err.message);
  }
});

//POPULATING
app.get("/daily-activities", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "dailyActivities.activityId"
    );
    if (!user) {
      return res.status(404).send("User not found.");
    }
    res.status(200).json(user.dailyActivities);
  } catch (err) {
    res.status(500).send("Error fetching daily activities: " + err.message);
  }
});

//LISTING THE LEADERBOARD
app.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ totalXp: -1 })
      .limit(10)
      .select("username totalXp -_id");
    res.render("leaderboard", { leaderboard });
  } catch (err) {
    res.status(500).send("Error fetching leaderboard: " + err.message);
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ totalXp: -1 })
      .limit(10)
      .select("username totalXp -_id");
    res.status(200).json(leaderboard);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching leaderboard: " + err.message });
  }
});

app.use((req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1>");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;
