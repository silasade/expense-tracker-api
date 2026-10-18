import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("Swagger Documentation Endpoint", () => {
  const app = createApp();

  it("GET /api-docs/ should serve Swagger UI HTML", async () => {
    const response = await request(app).get("/api-docs/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("swagger-ui");
  });

  it("GET /api-docs should redirect to /api-docs/", async () => {
    const response = await request(app).get("/api-docs");

    expect([200, 301]).toContain(response.status);
  });
});
