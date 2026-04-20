import { jest } from "@jest/globals";

const mockFrom = jest.fn();

const mockAuth = (req, res, next) => next();
const mockAuthorize = () => (req, res, next) => next();

jest.unstable_mockModule("../database/supabaseConfig.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

jest.unstable_mockModule("../middleware/authMiddleware.js", () => ({
  authMiddleware: mockAuth,
}));

jest.unstable_mockModule("../middleware/roleMiddleware.js", () => ({
  authorize: mockAuthorize,
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");

describe("Projects API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create project successfully", async () => {
    mockFrom.mockReturnValue({
      insert: async () => ({
        data: [{ id: 1 }],
        error: null,
      }),
    });

    const res = await request(app)
      .post("/project")
      .send({
        projectData: {
          projectName: "Test Project",
          projectDescription: "Desc",
          projectCategory: "Web",
          projectPriority: "High",
          duration: 10,
          creator: { email: "a@test.com", uid: "1" },
          projectManager: { email: "b@test.com", uid: "2" },
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Project created successfully");
  });

  it("should fail when DB error occurs on create", async () => {
    mockFrom.mockReturnValue({
      insert: async () => ({
        data: null,
        error: "db error",
      }),
    });

    const res = await request(app)
      .post("/project")
      .send({
        projectData: {
          projectName: "Test",
          creator: { email: "a", uid: "1" },
          projectManager: { email: "b", uid: "2" },
        },
      });

    expect(res.statusCode).toBe(500);
  });

  it("should return project if user has access", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              uid: "123",
              users: [{ uid: "user1" }],
            },
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app).get("/project/user1/123");

    expect(res.statusCode).toBe(200);
  });

  it("should return 404 if project not found", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: null,
            error: true,
          }),
        }),
      }),
    });

    const res = await request(app).get("/project/user1/999");

    expect(res.statusCode).toBe(404);
  });

  it("should return 403 if user has no access", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              uid: "123",
              users: [{ uid: "other" }],
            },
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app).get("/project/user1/123");

    expect(res.statusCode).toBe(403);
  });

  it("should return all projects for user", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        contains: async () => ({
          data: [
            { id: 1, users: [{ uid: "user1" }] },
            { id: 2, users: [{ uid: "user1" }] },
          ],
        }),
      }),
    });

    const res = await request(app).get("/project/user1");

    expect(res.statusCode).toBe(200);
  });

  it("should update project successfully", async () => {
    mockFrom.mockReturnValue({
      update: () => ({
        eq: () => ({
          select: async () => ({
            data: [{ id: 1 }],
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app)
      .patch("/project/123")
      .send({ name: "Updated" });

    expect(res.statusCode).toBe(200);
  });

  it("should delete project successfully", async () => {
    mockFrom.mockReturnValue({
      delete: () => ({
        eq: async () => ({
          error: null,
        }),
      }),
    });

    const res = await request(app).delete("/project/123");

    expect(res.statusCode).toBe(200);
  });
});
