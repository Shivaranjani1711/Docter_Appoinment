import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("auth flow", () => {
  const credentials = {
    email: "newpatient@test.com",
    password: "StrongPass123",
    fullName: "New Patient",
    role: "PATIENT" as const,
    acceptedTerms: true as const,
  };

  it("registers a new patient and returns an access token", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(credentials);
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(credentials.email);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects a duplicate registration email", async () => {
    await request(app).post("/api/v1/auth/register").send(credentials);
    const res = await request(app).post("/api/v1/auth/register").send(credentials);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_IN_USE");
  });

  it("rejects login with a wrong password", async () => {
    await request(app).post("/api/v1/auth/register").send(credentials);
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: credentials.email, password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("logs in with correct credentials", async () => {
    await request(app).post("/api/v1/auth/register").send(credentials);
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: credentials.email, password: credentials.password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("rejects an unauthenticated request to a protected route", async () => {
    const res = await request(app).get("/api/v1/users/me");
    expect(res.status).toBe(401);
  });
});
