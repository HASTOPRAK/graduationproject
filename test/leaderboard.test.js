import mongoose from "mongoose";
import request from "supertest";
import app from "../index.js";
import { expect } from "chai";
import User from "../models/User.js";

describe("Leaderboard Tests", function () {
  this.timeout(10000);

  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    await User.create([
      {
        email: "user1@email.com",
        username: "user1",
        password: "dummyPassword1",
        totalXp: 300,
      },
      {
        email: "user2@email.com",
        username: "user2",
        password: "dummyPassword2",
        totalXp: 500,
      },
      {
        email: "user3@email.com",
        username: "user3",
        password: "dummyPassword3",
        totalXp: 100,
      },
    ]);
  });

  after(async () => {
    await User.deleteMany({
      email: { $in: ["user1@email.com", "user2@email.com", "user3@email.com"] },
    });
    await mongoose.connection.close();
  });

  it("should return a sorted list of users by total XP", async () => {
    const res = await request(app).get("/api/leaderboard");

    expect(res.status).to.equal(200);

    const leaderboard = res.body;
    expect(leaderboard).to.be.an("array").that.is.not.empty;

    for (let i = 1; i < leaderboard.length; i++) {
      expect(leaderboard[i - 1].totalXp).to.be.at.least(leaderboard[i].totalXp);
    }
  });

  it("should include each user's information", async () => {
    const res = await request(app).get("/api/leaderboard");

    expect(res.status).to.equal(200);

    const leaderboard = res.body;
    expect(leaderboard).to.be.an("array").that.is.not.empty;

    leaderboard.forEach((user) => {
      expect(user).to.have.property("username").that.is.a("string");
      expect(user).to.have.property("totalXp").that.is.a("number");
    });
  });
});
