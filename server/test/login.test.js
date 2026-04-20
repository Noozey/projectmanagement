import { jest } from "@jest/globals";

// MOCKS
const mockCompare = jest.fn();
const mockSign = jest.fn();
const mockFrom = jest.fn();

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: mockCompare,
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: mockSign,
  },
}));

jest.unstable_mockModule("../database/supabaseConfig.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");

describe("POST /login", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should login successfully", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              name: "Rohan",
              email: "test@test.com",
              password: "hashedpass",
              avatar: "img.png",
              uid: "123",
            },
            error: null,
          }),
        }),
      }),
    });

    mockCompare.mockResolvedValue(true);
    mockSign.mockReturnValue("fake_token");

    const res = await request(app).post("/login").send({
      email: "test@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe("fake_token");
  });

  it("should fail if user not found", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app).post("/login").send({
      email: "wrong@test.com",
      password: "123",
    });

    expect(res.statusCode).toBe(401);
  });

  it("should fail if password incorrect", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              name: "Rohan",
              email: "test@test.com",
              password: "hashedpass",
              avatar: "img.png",
              uid: "123",
            },
            error: null,
          }),
        }),
      }),
    });

    mockCompare.mockResolvedValue(false);

    const res = await request(app).post("/login").send({
      email: "test@test.com",
      password: "wrong",
    });

    expect(res.statusCode).toBe(401);
  });
});
