// tests/routes.test.js
const request = require("supertest");
const app = require("../src/app");

describe("Health Route", () => {
    describe("GET /health", () => {
        it("should return 200 status", async () => {
            const res = await request(app).get("/health");
            expect(res.statusCode).toBe(200);
        });

        it("should return healthy status", async () => {
            const res = await request(app).get("/health");
            expect(res.body).toHaveProperty("status", "healthy");
        });

        it("should include required health check fields", async () => {
            const res = await request(app).get("/health");
            expect(res.body).toHaveProperty("timestamp");
            expect(res.body).toHaveProperty("uptime");
            expect(res.body).toHaveProperty("environment");
            expect(res.body).toHaveProperty("version");
            expect(res.body).toHaveProperty("memoryUsage");
        });

        it("should include memory usage details", async () => {
            const res = await request(app).get("/health");
            expect(res.body.memoryUsage).toHaveProperty("rss");
            expect(res.body.memoryUsage).toHaveProperty("heapUsed");
        });
    });
});
