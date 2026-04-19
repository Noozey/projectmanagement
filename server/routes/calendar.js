import express from "express";
import { supabase } from "../database/supabaseConfig.js";

const clanderRouter = express.Router();

clanderRouter.post("/", async (req, res) => {
  console.log(req);
  try {
    const { projectID, events } = req.body;

    if (!projectID) {
      return res.status(400).json({ error: "projectID is required" });
    }

    if (!events || typeof events !== "object") {
      return res.status(400).json({ error: "events must be a valid object" });
    }

    const rows = [];

    for (const [date, dayEvents] of Object.entries(events)) {
      for (const event of dayEvents) {
        rows.push({
          project_id: projectID,
          event_id: String(event.id),
          date,
          title: event.title,
          time: event.time || null,
          description: event.description || null,
          meeting_link: event.meetingLink || null,
        });
      }
    }

    // Step 1: Delete all existing events for this project
    const { error: deleteError } = await supabase
      .from("calendar_events")
      .delete()
      .eq("project_id", projectID);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({ error: "Failed to clear existing events" });
    }

    // Step 2: Insert new events (if any)
    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from("calendar_events")
        .insert(rows);

      if (insertError) {
        console.error("Insert error:", insertError);
        return res.status(500).json({ error: "Failed to save events" });
      }
    }

    return res.status(200).json({
      message: "Calendar saved successfully",
      projectID,
      totalEvents: rows.length,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

clanderRouter.get("/:projectID", async (req, res) => {
  try {
    const { projectID } = req.params;

    if (!projectID) {
      return res.status(400).json({ error: "projectID is required" });
    }

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("project_id", projectID)
      .order("date", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch events" });
    }

    // Rebuild events map: { "2026-2-18": [{ id, title, time, ... }] }
    const eventsMap = {};

    for (const row of data) {
      if (!eventsMap[row.date]) {
        eventsMap[row.date] = [];
      }
      eventsMap[row.date].push({
        id: Number(row.event_id),
        title: row.title,
        time: row.time || "",
        description: row.description || "",
        meetingLink: row.meeting_link || "",
      });
    }

    return res.status(200).json({ projectID, events: eventsMap });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export { clanderRouter };
