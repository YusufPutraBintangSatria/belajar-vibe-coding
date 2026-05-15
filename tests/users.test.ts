import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/index";
import { db } from "../src/db";
import { users, sessions } from "../src/schema";
import { sql } from "drizzle-orm";

describe("Users API", () => {
  beforeEach(async () => {
    // Clear data for consistent tests
    // Using sql.raw for MySQL truncate if needed, or just delete
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("POST /api/users (Registration)", () => {
    it("should register a user with valid data", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBe("OK");
    });

    it("should return 400 for duplicate email", async () => {
      // Setup: register a user first
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Original User",
            email: "test@example.com",
            password: "password123",
          }),
        })
      );

      // Attempt duplicate email
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Duplicate User",
            email: "test@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Email sudah terdaftar");
    });

    it("should return 400 for name longer than 255 characters", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "a".repeat(300),
            email: "longname@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBeDefined();
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Register a user to test login
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Login User",
            email: "login@example.com",
            password: "password123",
          }),
        })
      );
    });

    it("should login with valid credentials", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined(); // Token
    });

    it("should return 401 for invalid password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@example.com",
            password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/users/current", () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get a token
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Current User",
            email: "current@example.com",
            password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "current@example.com",
            password: "password123",
          }),
        })
      );
      const loginBody = await loginRes.json();
      token = loginBody.data;
    });

    it("should get user profile with valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`
          },
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.email).toBe("current@example.com");
    });

    it("should return 401 for missing token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "POST",
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/users/logout", () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get a token
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Logout User",
            email: "logout@example.com",
            password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "logout@example.com",
            password: "password123",
          }),
        })
      );
      const loginBody = await loginRes.json();
      token = loginBody.data;
    });

    it("should logout successfully", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: { 
            "Authorization": `Bearer ${token}`
          },
        })
      );

      expect(response.status).toBe(200);
      
      // Verify token is gone by trying to access current user
      const currentRes = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`
          },
        })
      );
      expect(currentRes.status).toBe(401);
    });

    it("should return 401 for invalid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: { 
            "Authorization": "Bearer invalid-token"
          },
        })
      );

      expect(response.status).toBe(401);
    });
  });
});
