import http from "http";
import app from "./app.js";
import { initSocket } from "./config/socket.js";
import registerSocketHandlers from "./sockets/index.js";

const PORT = 3001;

const server = http.createServer(app);

const io = initSocket(server);
app.set("socketio", io);
registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
