import http from"http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
// Pug로 view engine 설정
app.set("views", __dirname + "/views");
// express에 templatedl 어디 있는지 지정
app.use("/public", express.static(__dirname + "/public"));
// public url 생성해 유저에게 파일 공유
app.get("/", (req, res) => res.render("home"));
// home.pug를 render 해주는 route handler 만들기
app.get("/*", (req, res) => res.redirect("/"));

const handleListten = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function onSocketClose() {
    console.log("Disconnected from the Browser");
}

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    console.log("Connected to Browser ✅");
    socket.on("close", () => onSocketClose);
    socket.on("message", (message) => {
        console.log(message.toString("utf-8"));
        sockets.forEach(aSocket => aSocket.send(message.toString()));
        });
  });

server.listen(3000, handleListten);

{
type:"message";
payload:"hello everyone!";
}
{
type:"nickname";
payload:"hey";
}