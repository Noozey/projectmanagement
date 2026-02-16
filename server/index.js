import express from "express";
import cros from "cors";
import { tokenRouter } from "./routes/tokengen.js";
import { loginRouter } from "./routes/login.js";
import { registerRouter } from "./routes/register.js";
import { checkAuthrouter } from "./routes/checkauth.js";
import { clanderRouter } from "./routes/calendar.js";
import { projectsRouter } from "./routes/projects.js";
import { userRouter } from "./routes/user.js";
import { kanbanRouter } from "./routes/kanban.js";
import { Server } from "socket.io";
import http from "http";

const PORT = 3001;

const app = express();
const server = http.createServer(app);
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

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
app.use("/kanban", kanbanRouter);
app.use("/token", tokenRouter);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("send_message", (data) => {
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("userDisconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
