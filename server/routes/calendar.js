import express from "express";

const clanderRouter = express.Router();

clanderRouter.post("/", (req, res) => {
  const { events } = req.body;

  console.log(events);
});

export { clanderRouter };
