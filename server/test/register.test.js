import { jest } from "@jest/globals";

const mockHash = jest.fn();
const mockFrom = jest.fn();

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: mockHash,
  },
}));

jest.unstable_mockModule("../database/supabaseConfig.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");

describe("POST /register", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register user successfully", async () => {
    mockHash.mockResolvedValue("hashedPassword");

    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    mockFrom.mockReturnValueOnce({
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: {
              name: "Rohan",
              email: "test@test.com",
            },
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app).post("/register").send({
      name: "Rohan",
      email: "test@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Account created successfully");
  });

  it("should fail if email already exists", async () => {
    mockHash.mockResolvedValue("hashedPassword");

    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { email: "test@test.com" },
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app).post("/register").send({
      name: "Rohan",
      email: "test@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email already exists");
  });

  it("should return 500 on database error", async () => {
    mockHash.mockResolvedValue("hashedPassword");

    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
            error: { code: "OTHER_ERROR" },
          }),
        }),
      }),
    });

    const res = await request(app).post("/register").send({
      name: "Rohan",
      email: "test@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(500);
  });
});
