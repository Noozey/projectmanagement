import { jest } from "@jest/globals";

const mockFrom = jest.fn();

jest.unstable_mockModule("../database/supabaseConfig.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

// IMPORT AFTER MOCK
const { default: request } = await import("supertest");
const { default: app } = await import("../app.js");

describe("Calendar API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should save calendar successfully", async () => {
    mockFrom.mockReturnValueOnce({
      delete: () => ({
        eq: async () => ({ error: null }),
      }),
    });

    mockFrom.mockReturnValueOnce({
      insert: async () => ({ error: null }),
    });

    const res = await request(app)
      .post("/calendar")
      .send({
        projectID: "123",
        events: {
          "2026-01-01": [
            {
              id: 1,
              title: "Meeting",
              time: "10:00",
            },
          ],
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Calendar saved successfully");
    expect(res.body.totalEvents).toBe(1);
  });

  it("should fail if projectID missing", async () => {
    const res = await request(app).post("/calendar").send({
      events: {},
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("projectID is required");
  });

  it("should fail if events invalid", async () => {
    const res = await request(app).post("/calendar").send({
      projectID: "123",
      events: "wrong",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("events must be a valid object");
  });

  it("should return 500 if delete fails", async () => {
    mockFrom.mockReturnValueOnce({
      delete: () => ({
        eq: async () => ({ error: "delete error" }),
      }),
    });

    const res = await request(app).post("/calendar").send({
      projectID: "123",
      events: {},
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to clear existing events");
  });

  it("should fetch calendar successfully", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: async () => ({
            data: [
              {
                project_id: "123",
                event_id: "1",
                date: "2026-01-01",
                title: "Meeting",
                time: "10:00",
                description: null,
                meeting_link: null,
              },
            ],
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app).get("/calendar/123");

    expect(res.statusCode).toBe(200);
    expect(res.body.projectID).toBe("123");
    expect(res.body.events["2026-01-01"].length).toBe(1);
  });

  it("should return 500 if fetch fails", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: async () => ({
            data: null,
            error: "fetch error",
          }),
        }),
      }),
    });

    const res = await request(app).get("/calendar/123");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to fetch events");
  });
});
