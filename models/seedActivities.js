import mongoose from "mongoose";
import dotenv from "dotenv";
import Activity from "./Activity.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const activities = [
  {
    category: "body",
    tier: "Came",
    description: "Walk for 15 minutes",
    xp: 50,
  },
  { category: "body", tier: "Came", description: "Run for 10 minutes", xp: 50 },
  {
    category: "body",
    tier: "Came",
    description: "Light weight training",
    xp: 50,
  },
  { category: "body", tier: "Saw", description: "Walk for 30 minutes", xp: 75 },
  { category: "body", tier: "Saw", description: "Run for 30 minutes", xp: 75 },
  {
    category: "body",
    tier: "Saw",
    description: "Usual weight training",
    xp: 75,
  },
  {
    category: "body",
    tier: "Conquered",
    description: "Walk for 60 minutes",
    xp: 100,
  },
  {
    category: "body",
    tier: "Conquered",
    description: "Run for 45 minutes",
    xp: 100,
  },
  {
    category: "body",
    tier: "Conquered",
    description: "Hard weight training",
    xp: 100,
  },

  {
    category: "diet",
    tier: "Came",
    description: "Drink more than 2 liters of water",
    xp: 50,
  },
  {
    category: "diet",
    tier: "Came",
    description: "Eat a healthy snack",
    xp: 50,
  },
  {
    category: "diet",
    tier: "Came",
    description: "Do not consume liquid calories",
    xp: 50,
  },
  {
    category: "diet",
    tier: "Saw",
    description: "Do not consume processed food",
    xp: 75,
  },
  {
    category: "diet",
    tier: "Saw",
    description: "Eat any available fruit",
    xp: 75,
  },
  { category: "diet", tier: "Saw", description: "Do not skip a meal", xp: 75 },
  {
    category: "diet",
    tier: "Conquered",
    description: "Eat what you cook",
    xp: 100,
  },
  {
    category: "diet",
    tier: "Conquered",
    description: "Stick to the calorie counter",
    xp: 100,
  },
  {
    category: "diet",
    tier: "Conquered",
    description: "Complete your macros",
    xp: 100,
  },

  {
    category: "mind",
    tier: "Came",
    description: "Meditate for 10 minutes",
    xp: 50,
  },
  { category: "mind", tier: "Came", description: "Talk to a friend", xp: 50 },
  { category: "mind", tier: "Came", description: "Express gratitude", xp: 50 },
  {
    category: "mind",
    tier: "Saw",
    description: "Meditate for 20 minutes",
    xp: 75,
  },
  {
    category: "mind",
    tier: "Saw",
    description: "Engage in a social event",
    xp: 75,
  },
  { category: "mind", tier: "Saw", description: "Engage with a hobby", xp: 75 },
  {
    category: "mind",
    tier: "Conquered",
    description: "Meditate for 30 minutes",
    xp: 100,
  },
  {
    category: "mind",
    tier: "Conquered",
    description: "Meet someone new",
    xp: 100,
  },
  {
    category: "mind",
    tier: "Conquered",
    description: "Spend quality time with a loved one",
    xp: 100,
  },

  {
    category: "sleep",
    tier: "Came",
    description: "Avoid screen time 15 minutes before bed",
    xp: 50,
  },
  {
    category: "sleep",
    tier: "Came",
    description: "Optimize sleep environment",
    xp: 50,
  },
  {
    category: "sleep",
    tier: "Came",
    description: "Practice deep breathing",
    xp: 50,
  },
  {
    category: "sleep",
    tier: "Saw",
    description: "Avoid screen time 30 minutes before bed",
    xp: 75,
  },
  { category: "sleep", tier: "Saw", description: "Drink herbal tea", xp: 75 },
  {
    category: "sleep",
    tier: "Saw",
    description: "Build a bedtime routine",
    xp: 75,
  },
  {
    category: "sleep",
    tier: "Conquered",
    description: "Avoid screen time 60 minutes before bed",
    xp: 100,
  },
  {
    category: "sleep",
    tier: "Conquered",
    description: "Read until you feel sleepy",
    xp: 100,
  },
  {
    category: "sleep",
    tier: "Conquered",
    description: "Get sunlight as soon as you wake up",
    xp: 100,
  },
];

const seedDB = async () => {
  try {
    await Activity.deleteMany({});
    await Activity.insertMany(activities);
    console.log("Activities seeded successfully");
  } catch (err) {
    console.error("Error seeding activities:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
