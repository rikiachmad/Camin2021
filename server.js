const app = require('express')();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;
const io = require('socket.io')(server);

const {joinUser, removeUser, findUser} = require('./users');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});

let thisRoom = "";
io.on('connection', (socket) => {
    
    socket.on("join room", (data) => {
      console.log('in room');
      let Newuser = joinUser(socket.id, data.username,data.roomName)
      
      socket.emit('send data' , {id : socket.id ,username:Newuser.username, roomname : Newuser.roomname });
     
      thisRoom = Newuser.roomname;
      console.log(Newuser);
      socket.join(Newuser.roomname);
    });
    socket.on('chat message', (msg) => {
      console.log(msg);
      thisRoom = msg.room;
      io.to(thisRoom).emit("chat message", {msg:msg,id : socket.id});
    });
});

io.on('connection', (socket) => {

    socket.on("disconnect", () => {
      // console.log(user);
      const user = removeUser(socket.id);
      if(user) {
        console.log(user.username + ' has left');
      }
      console.log("disconnected");
    });
});

