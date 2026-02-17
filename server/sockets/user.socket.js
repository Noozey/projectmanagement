import jwt from "jsonwebtoken";

export default function userHandler(io, socket) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      socket.disconnect();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = decoded.uid;
    socket.join(socket.userId);

    console.log("Authenticated user:", socket.userId);
  } catch (err) {
    console.log("Invalid token");
    socket.disconnect();
  }
}
