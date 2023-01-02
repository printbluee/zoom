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

wss.on("connection", (socket) => {
    console.log("Connected to Browser");
    socket.on("close", () => console.log("Disconnected from the Browser "));
    socket.on("message", message => {
        console.log(message);
    })
    socket.send('hello !!');
});

server.listen(3000, handleListten);