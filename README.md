# Camin2021 - Socket


## Definisi

*A socket is one endpoint of a two-way communication link between two programs running on the network*. 

An endpoint is a combination of an IP address and a port number so that the TCP layer can identify the application that data is destined to be sent to.

## Kebutuhan
- Peserta menginstall dan mempelajari Node.js dan NPM

## Socket IO 

- Socket.IO is a library that enables real-time, bidirectional and event-based communication between the browser and the server

### Membuat Simple Chat

Install package yang dibutuhkan

```console
npm init
npm install socket.io socket.io-client
npm install express@4
```
<br>
Buat file index.html yang akan menjadi front end utama

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Socket.IO chat</title>
    <style>
      body { margin: 0; padding-bottom: 3rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      #form { background: rgba(0, 0, 0, 0.15); padding: 0.25rem; position: fixed; bottom: 0; left: 0; right: 0; display: flex; height: 3rem; box-sizing: border-box; backdrop-filter: blur(10px); }
      #input { border: none; padding: 0 1rem; flex-grow: 1; border-radius: 2rem; margin: 0.25rem; }
      #input:focus { outline: none; }
      #form > button { background: #333; border: none; padding: 0 1rem; margin: 0.25rem; border-radius: 3px; outline: none; color: #fff; }
      #messages { list-style-type: none; margin: 0; padding: 0; }
      #messages > li { padding: 0.5rem 1rem; }
      #messages > li:nth-child(odd) { background: #efefef; }
    </style>
  </head>
  <body>
    <ul id="messages"></ul>
    <form id="form" action="">
      <input id="input" autocomplete="off" /><button>Send</button>
    </form>
  </body>
</html>
```
<br>

Buat file server.js. File ini akan menjadi server utama kita.
Masukan code berikut untuk meninisiate socket io.

```javascript
// Ref https://socket.io/docs/v3/server-api/index.html
const app = require('express')();
const server = require('http').Server(app);
const port = process.env.PORT || 3000;
const io = require('socket.io')(server);

// Route server root to index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
```
Kode diatas akan menginisiasi server kita dan ketika mengakses '/' akan dialihkan ke index.html

Kemudian setting agar server menerima koneksi dari port 3000.
```js
// server and listen to port 3000
server.listen(port, () => {
    console.log(`Socket.IO server running at http://127.0.0.1:${port}/`);
});
```

Kemudian jalankan cli ``` node server.js ``` untuk menjalankan server kemudian buka http://127.0.0.1:3000. Maka seharusnya dialihkan ke halaman index.html.

Kemudian membutuhkan event handler agar bisa mendeteksi ketika terjadi koneksi melalui sokcet.

```js
io.on('connection', (socket) => {
  console.log('a user connected');
});
```

Selanjutnya kita juga harus konfigurasi pada index.html agar bisa terhubung melalui socket

Pada index.html tambahkan agar kita bisa menggunakan socker io.
```html
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();
</script>
```

### Emitting Event

Untuk mengirim event melalui socket maka kita membutuhkan event handler

pada kasus ini kita harus mengirim teks dari clien ke server. Maka tambahkan kode berikut pada tag script di index.html setelah deklarasi socket.io.

```js
var form = document.getElementById('form');
  var input = document.getElementById('input');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });
```
Kode diatas membuat event listener ketika ada form disubmit maka client akan mengirim pesan melalui event emiter dengan nama event ```'chat message'```.

Kemudian pada server harus menerima data dari client maka kita bisa mengeceknya dengan menampilkan data dari event handler ```chat message```. Tambahkan code berikut pada server.js

```js
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });
});
```

Kemudian server akan melanjutkan ke semua user dengan event emiter. Tambahkan kode berikut dibawah ```js console.log('message: ' + msg);``` pada server.js

```js
  io.emit('chat message', msg);
```

Pada client juga harus bisa menerima event emit dari server maka tambahkan kode block dibawah
```js
socket.on('chat message', function(msg) {
    console.log(msg);
  });
```
Untuk menampilkan pesan yang didapat ke dalam html tambahkan kode dibawah ini setelah ```console.log(msg);```

```js
var item = document.createElement('li');
item.textContent = msg;
messages.appendChild(item);
window.scrollTo(0, document.body.scrollHeight);
```
Jika server masih nyala matikan terlebih dahulu (ctrl+c/ctrl+z) Kemudian jalankan cli ``` node server.js ``` untuk menjalankan server kemudian buka http://127.0.0.1:3000. Simple Chat App sudah bisa dijalankan.

### User dan Room

Selanjutnya kita akan mengimplentasi sistem room dan user.
User memungkinkan kita memberi nama pada setiap koneksi yang terhubung dan juga menyimpan data lain.

Buat users.js yang akan kita jadikan library untuk fungsi user.
Pada users.js
Buat array untuk menyimpan data user.
```js
let users = [];
```
Kemudian kita harus menghandle ketika user bergabung

```js
function joinUser(socketId , userName, roomName) {
const user = {
  socketID :  socketId,
  username : userName,
  roomname : roomName
}
  users.push(user)
return user;
}
```
Kemudian buat juga fungsi ketika user disconect
```js
function removeUser(id) {
  const getID = users => users.socketID === id;
 const index =  users.findIndex(getID);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}
```
kemudian tambahkan juga ```module.export ``` untuk meng-export fungsi yang baru saja kita buat :
```js
	module.exports = { joinUser, removeUser }
```

Kemudian untuk pada index.html kita tambahkan script berikut sebelum pada tag script sebelum insiasi socket.io.
```js
let userName = prompt("whats your name");
let room = prompt("room name");
let ID = "";
```

Kemudian kita buat event emit ``'join room'`` ketika user join sebuah room. Tambahkan script berikut pada tag script
```js
socket.emit("join room", {username : userName, roomName : room});
```

Kemudian pada server.js import users.js 
```js
const {joinUser, removeUser, findUser} = require('./users');
```

Tambahkan juga variable ```thisRoom```
```js
let  thisRoom = "";
```

karena kita akan menerima data maka tambahkan kode block dibawah kedalam event handler ```'connection```
```js
socket.on("join room", (data) => {
    console.log('in room');
    let Newuser = joinUser(socket.id, data.username,data.roomName)

    socket.emit('send data' , {id : socket.id ,username:Newuser.username, roomname : Newuser.roomname });
   
    thisRoom = Newuser.roomname;
    console.log(Newuser);
    socket.join(Newuser.roomname);
  });
```
Ubah juga handler ```chat message``` menjadi seperti berikut:
```js
socket.on('chat message', (msg) => {
// console.log('message: ' + msg.value + ' user: ' + msg.user);
	console.log(msg);
	thisRoom = msg.room;
	io.to(thisRoom).emit("chat message", {msg:msg,id :  socket.id})
});
```

Tambahkan juga event handler ```disconnect``` ketika seorang user disconnect dari suatu room:
```js
socket.on('disconnect', (socket) => {
	const  user = removeUser(socket.id);
	console.log(user);
	if(user) {
		console.log(user.username + ' has left');
	}
console.log("disconnected");

});
```

Selanjutnya pada tag script di index.html tambahkan 

```js
socket.on('send data',(data)=>{
    ID = data.id;
    console.log(" my Socket ID:" + ID);
})
```
event tersebut untuk menerima data dari server.

kemudian modifikasi event handler chat messege index.html menjadi
```js
socket.on('chat message', (msg) => {
    console.log(msg);
    thisRoom = msg.room;
    io.to(thisRoom).emit("chat message", {msg:msg,id : socket.id});
});
```
kemudian modifikasi event emiter chat message index.html menjadi

```js
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', {
    value: input.value,
    user: userName,
    room: room,})
    input.value = '';
  }
});
```




## Penugasan
  
### Socket Draw
- Penugasan bersifat **kelompok** (2 orang, diplotting-kan silahkan cek drive camin)
- Sistem terdapat shared whiteboard silahkan mempelajari referensi [berikut]([https://link](https://github.com/socketio/socket.io/tree/master/examples/whiteboard))
- User bisa berkomunikasi melalui kolom chat
- Terdapat 3 endpoint
  - 1 endpoint untuk whiteboard colaborative dimana semua user bisa manggambar sesukanya
  - 1 endpoint untuk privat whiteboard colaborative dimana hanya orang tertentu yang memiliki password
  - 1 endpoint untuk broadcast whiteboard dimana hanya 1 orang yang bisa menulis sementara lainya hanya bisa melihaat
- Untuk setiap user yang tergabung maka akan memiliki warna pen yang berbeda
- Buatlah juga markdown yang menjelaskan fitur dan pengggunaan aplikasi yang kamu buat
- Implementasi fitur tambahan diperbolehkan
- Hasil akhir penugasan berupa repository github
- Lakukan commit secara berkala
- Jadikan google sebagai teman kalian

#### Penilaian Kelompok
- Implementasi Fitur Utama penugasan 0-75
- Kreativitas (Subjektif) 0-25

#### Penilaian Individu
- Kontribusi terhadap kelompok melalui commit pada repository
- Pemahaman
- Penyampaian
