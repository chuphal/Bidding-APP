const socket = io();

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("message");

socket.on("message-backend", (message) => [
  console.log("message from backend", message),
]);

sendBtn.addEventListener("click", (event) => {
  const message = messageInput.value;
  console.log("send", message);
  socket.emit("message", message);
});
