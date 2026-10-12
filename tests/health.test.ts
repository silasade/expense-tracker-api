import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("Health Check Endpoint", () => {
  const app = createApp();

  it("GET /health should return 200 with status OK", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      status: "OK",
      timeStamp: expect.any(String),
    });
  });
});
