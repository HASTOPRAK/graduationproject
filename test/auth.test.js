import mongoose from "mongoose";
import request from "supertest";
import app from "../index.js";
import { expect } from "chai";
import User from "../models/User.js";

describe("Auth API Tests", function () {
  this.timeout(10000);

  before(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
      console.error("Error during setup:", err);
    }
  });

  after(async () => {
    try {
      await User.deleteOne({ email: "newuser@email.com" });
      await mongoose.connection.close();
    } catch (err) {
      console.error("Error during teardown:", err);
    }
  });

  it("should return 302 and redirect to / for /login", async () => {
    try {
      console.log("Sending POST request to /login...");
      const res = await request(app).post("/login").send({
        email: "testuser@email.com",
        password: "123123",
      });

      console.log("Response received from /login:", res.body);
      console.log("Response status:", res.status);

      expect(res.status).to.equal(302);
      expect(res.headers.location).to.equal("/");
    } catch (err) {
      console.error("Error during login test:", err);
      throw err;
    }
  });
  it("should register a new user and redirect to /login", async function () {
    const res = await request(app).post("/register").send({
      email: "newuser@email.com",
      username: "newuser",
      password: "123456",
    });

    expect(res.status).to.equal(302);
    expect(res.headers.location).to.equal("/login");
  });

  it("should return 400 for missing registration fields", async function () {
    const res = await request(app).post("/register").send({
      email: "partialuser@email.com",
    });

    // Expect a 400 status
    expect(res.status).to.equal(400);
    expect(res.text).to.equal("All fields are required.");
  });

  it("should return 401 for invalid email", async () => {
    const res = await request(app).post("/login").send({
      email: "nonexistent@email.com",
      password: "123123",
    });
    expect(res.status).to.equal(401);
    expect(res.text).to.equal("Invalid email.");
  });

  it("should return 401 for invalid password", async () => {
    const res = await request(app).post("/login").send({
      email: "testuser@email.com",
      password: "wrongpassword",
    });
    expect(res.status).to.equal(401);
    expect(res.text).to.equal("Invalid password.");
  });

  it("should return 400 for missing fields in login", async () => {
    const res = await request(app).post("/login").send({
      email: "",
    });
    expect(res.status).to.equal(400);
    expect(res.text).to.equal("All fields are required.");
  });

  it("should log out and clear the token cookie", async () => {
    const res = await request(app).get("/logout");
    expect(res.status).to.equal(302);
    expect(res.header.location).to.equal("/");
  });
});
