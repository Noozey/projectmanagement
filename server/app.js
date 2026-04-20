import express from "express";
import cors from "cors";
import { loginRouter } from "./routes/login.js";
import { tokenRouter } from "./routes/tokengen.js";
import { registerRouter } from "./routes/register.js";
import { checkAuthrouter } from "./routes/checkauth.js";
import { clanderRouter } from "./routes/calendar.js";
import { projectsRouter } from "./routes/projects.js";
import { userRouter } from "./routes/user.js";
import { kanbanRouter } from "./routes/kanban.js";
import { messageRouter } from "./routes/message.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
  }),
);

app.use("/access_token", tokenRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/verify", checkAuthrouter);
app.use("/calendar", clanderRouter);
app.use("/project", projectsRouter);
app.use("/user", userRouter);
app.use("/kanban", kanbanRouter);
app.use("/token", tokenRouter);
app.use("/messages", messageRouter);

export default app;
