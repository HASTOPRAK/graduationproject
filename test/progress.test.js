import mongoose from "mongoose";
import request from "supertest";
import app from "../index.js";
import { expect } from "chai";
import User from "../models/User.js";

describe("User Progress Tests", function () {
  this.timeout(10000);

  let testUserToken;

  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const registerRes = await request(app).post("/register").send({
      email: "progresstestuser@email.com",
      username: "progresstest",
      password: "testpassword",
    });
    expect(registerRes.status).to.equal(302);

    const loginRes = await request(app).post("/login").send({
      email: "progresstestuser@email.com",
      password: "testpassword",
    });
    expect(loginRes.status).to.equal(302);
    testUserToken = loginRes.headers["set-cookie"]
      .find((cookie) => cookie.startsWith("token"))
      .split(";")[0]
      .split("=")[1];
  });

  after(async () => {
    await User.deleteOne({ email: "progresstestuser@email.com" });
    await mongoose.connection.close();
  });

  it("should return total and category-specific XP", async () => {
    const user = await User.findOne({ email: "progresstestuser@email.com" });

    user.xpBreakdown = { body: 50, mind: 30, sleep: 20, diet: 10 };
    user.totalXp = 110;
    await user.save();

    const res = await request(app)
      .get("/user")
      .set("Cookie", `token=${testUserToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("xpBreakdown");
    expect(res.body.xpBreakdown).to.deep.equal({
      body: 50,
      mind: 30,
      sleep: 20,
      diet: 10,
    });
    expect(res.body).to.have.property("totalXp").that.equals(110);
  });

  it("should return the current streak", async () => {
    const user = await User.findOne({ email: "progresstestuser@email.com" });

    const recentActivityId = new mongoose.Types.ObjectId();
    user.activities = [
      {
        activityId: recentActivityId,
        date: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ];
    user.streak = 5;
    await user.save();

    const res = await request(app)
      .get("/user")
      .set("Cookie", `token=${testUserToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("streak").that.equals(5);
  });

  it("should reset streak if no activity is completed within 24 hours", async () => {
    const user = await User.findOne({ email: "progresstestuser@email.com" });

    const oldActivityId = new mongoose.Types.ObjectId();
    user.activities = [
      {
        activityId: oldActivityId,
        date: new Date(Date.now() - 25 * 60 * 60 * 1000),
      },
    ];
    user.streak = 5;
    await user.save();

    const res = await request(app)
      .get("/user")
      .set("Cookie", `token=${testUserToken}`);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.streak).to.equal(0);
  });
});
