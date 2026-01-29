import express from "express";

const kanbanRouter = express.Router();

kanbanRouter.get("/:id", (req, res) => {
  const { id } = req.params; // ✅ correct
  console.log(id);
  res.json("helloworld");
});

export { kanbanRouter };
