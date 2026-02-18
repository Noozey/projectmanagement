// sockets/kanban.socket.js
export default function kanbanHandler(io, socket) {
  socket.on("join_project", (projectId) => {
    if (!projectId) return;

    socket.join(projectId);
    console.log(`User ${socket.id} joined project room: ${projectId}`);
  });
}
