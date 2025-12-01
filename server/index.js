import express from "express";
import cros from "cors";
import { tokenRouter } from "./routes/tokengen.js";
import { loginRouter } from "./routes/login.js";
import { registerRouter } from "./routes/register.js";
import { checkAuthrouter } from "./routes/checkauth.js";
import { clanderRouter } from "./routes/calendar.js";
import { projectsRouter } from "./routes/projects.js";
import { userRouter } from "./routes/user.js";

const PORT = 3001;

const app = express();
app.use(express.json());

app.use(
  cros({
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
app.use("/token", tokenRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
