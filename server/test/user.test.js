import { jest } from "@jest/globals";

const mockFrom = jest.fn();

jest.unstable_mockModule("../database/supabaseConfig.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");

describe("User API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return user profile by email search", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        ilike: async () => ({
          data: [
            {
              id: 1,
              uid: "123",
              name: "Rohan",
              email: "test@test.com",
            },
          ],
          err: null,
        }),
      }),
    });

    const res = await request(app)
      .post("/user/profile")
      .send({ email: "test" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message.length).toBe(1);
    expect(res.body.message[0].email).toBe("test@test.com");
  });

  it("should return 500 if profile DB error", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        ilike: async () => ({
          data: null,
          err: "db error",
        }),
      }),
    });

    const res = await request(app)
      .post("/user/profile")
      .send({ email: "test" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Database error");
  });

  it("should fetch all users", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        err: null,
        data: [
          {
            id: 1,
            uid: "123",
            name: "Rohan",
            email: "test@test.com",
          },
        ],
      }),
    });

    const res = await request(app).get("/user");

    expect(res.statusCode).toBe(200);
    expect(res.body.message.length).toBe(1);
  });

  it("should return 400 if get users fails", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        err: "error",
        data: null,
      }),
    });

    const res = await request(app).get("/user");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Database error");
  });
});
