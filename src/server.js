import http from"http";
import express from 'express';
import { Server } from 'socket.io';
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug"); // Pug로 view engine 설정
app.set("views", __dirname + "/views"); // express에 templatedl 어디 있는지 지정
app.use("/public", express.static(__dirname + "/public")); // public url 생성해 유저에게 파일 공유
app.get("/", (req, res) => res.render("home")); // home.pug를 render 해주는 route handler 만들기
app.get("/*", (req, res) => res.redirect("/"));

const handleListten = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});

instrument(wsServer, {
    auth: false,
  });

function publicRooms() {
    const {
        sockets: {
            adapter: {sids, rooms},
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;    
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket['nickname'] = 'Anon';
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    socket.on('enter_room', (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
        wsServer.sockets.emit('room_change', publicRooms());
    });
    socket.on('disconnecting', () => {
        socket.rooms.forEach((room) => socket.to(room).emit('bye', socket.nickname, countRoom(room) -1));
    });
    socket.on('disconnect', () => {
        wsServer.sockets.emit('room_change', publicRooms());
    });
    socket.on('new_message', (msg,room, done) => {
        socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on('nickname', nickname => socket['nickname'] = nickname);
});

httpServer.listen(3000, handleListten);

// const sockets = [];
// function onSocketClose() {
//     console.log("Disconnected from the Browser");
// }
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket['nickname'] = '';
//     console.log("Connected to Browser ✅");
//     socket.on("close", onSocketClose);
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg.toString("utf8"));
//         switch(message.type) {
//             case 'new_message' : 
//                 sockets.forEach((aSocket) => 
//                     aSocket.send(`${socket.nickname}: ${message.payload}`));
//             case 'nickname' :
//                 socket['nickname'] = message.payload;
//         }
//     });
//   });

// socket.on('nickname', fn)
// socket.on('notification', fn)