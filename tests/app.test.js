// tests/app.test.js
const request = require("supertest");
const app = require("../src/app");

describe("App", () => {
    describe("GET /", () => {
        it("should return 200 status", async () => {
            const res = await request(app).get("/");
            expect(res.statusCode).toBe(200);
        });

        it("should serve content", async () => {
            const res = await request(app).get("/");
            expect(res.statusCode).toBe(200);
            // The root route serves the static index.html from public/
            expect(res.text).toBeTruthy();
        });
    });

    describe("GET /api/info", () => {
        it("should return application info with 200 status", async () => {
            const res = await request(app).get("/api/info");
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("application");
            expect(res.body).toHaveProperty("technology");
            expect(res.body).toHaveProperty("endpoints");
        });

        it("should list correct technology stack", async () => {
            const res = await request(app).get("/api/info");
            expect(res.body.technology).toMatchObject({
                runtime: "Node.js",
                framework: "Express.js",
                containerization: "Docker",
                ci_cd: "GitHub Actions",
            });
        });
    });

    describe("404 handling", () => {
        it("should return 404 for unknown routes", async () => {
            const res = await request(app).get("/nonexistent-route");
            expect(res.statusCode).toBe(404);
        });
    });
});
