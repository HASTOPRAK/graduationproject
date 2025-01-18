import mongoose from "mongoose";
import request from "supertest";
import app from "../index.js";
import { expect } from "chai";
import User from "../models/User.js";

describe("Activity API Tests", function () {
  this.timeout(10000);

  let testUserToken;

  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const registerRes = await request(app).post("/register").send({
      email: "activitytestuser@email.com",
      username: "activityuser",
      password: "testpassword",
    });
    expect(registerRes.status).to.equal(302);

    const loginRes = await request(app).post("/login").send({
      email: "activitytestuser@email.com",
      password: "testpassword",
    });

    expect(loginRes.status).to.equal(302);
    testUserToken = loginRes.headers["set-cookie"]
      .find((cookie) => cookie.startsWith("token"))
      .split(";")[0]
      .split("=")[1];
  });

  after(async () => {
    await User.deleteOne({ email: "activitytestuser@email.com" });
    await mongoose.connection.close();
  });

  it("should add an activity to the daily activity list", async () => {
    const activity = {
      description: "Test Activity",
      xp: 50,
      category: "body",
    };

    const newActivity = await request(app)
      .post("/add-activity")
      .set("Cookie", `token=${testUserToken}`)
      .send({ activityId: "6782e245b1c6efe0a32becd2" });

    expect(newActivity.status).to.equal(200);
    expect(newActivity.text).to.equal("Activity added to daily list.");
  });

  it("should mark an activity as completed", async () => {
    const completeActivity = await request(app)
      .post("/complete-activity")
      .set("Cookie", `token=${testUserToken}`)
      .send({ activityIds: ["6782e245b1c6efe0a32becd2"] });

    expect(completeActivity.status).to.equal(200);
    expect(completeActivity.body.message).to.equal("Activities completed.");
    expect(completeActivity.body.totalXp).to.be.a("number");
    expect(completeActivity.body.streak).to.be.a("number");
  });

  it("should update the XP breakdown correctly", async () => {
    const progress = await request(app)
      .get("/user")
      .set("Cookie", `token=${testUserToken}`);

    expect(progress.status).to.equal(200);
    expect(progress.body).to.have.property("xpBreakdown");
    expect(progress.body.xpBreakdown).to.have.property("body");
    expect(progress.body.totalXp).to.be.a("number");
  });
});
