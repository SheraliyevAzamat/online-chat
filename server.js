const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 4000 });

let clients = []; 

server.on("connection", (ws) => {
  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === "login") {
      ws.username = parsedMessage.username;
      clients.push(ws);
      console.log(`${ws.username} joined the chat.`);

      broadcast({
        type: "userlist",
        users: clients.map((client) => client.username),
      });
    } else if (parsedMessage.type === "message") {
      const timestamp = new Date().toLocaleTimeString();
      const fullMessage = {
        type: "message",
        sender: ws.username,
        text: parsedMessage.text,
        time: timestamp,
      };

      broadcast(fullMessage);
    }
  });

  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
    console.log(`${ws.username} left the chat.`);

    broadcast({
      type: "userlist",
      users: clients.map((client) => client.username),
    });
  });
});

function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

console.log("Server in running is http://localhost:4000");