const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require('path');
const multer = require('multer');
const cors=require("cors");
const {userJoin,getCurrentUser,userLeave,getRoomusers}=require("./users.js");
app.use(express.static(path.join(__dirname, "/../Frontend/public")));
app.use(express.static(path.join(__dirname, "/uploads")));
app.get('/', function(req,res){
    res.sendFile(path.resolve(__dirname + '/../Frontend/public/start.html'));
});
app.get("/hi",(req,res)=>{
  res.send("dsfsdf");
})
//const users = {}
io.on('connection', async (socket) => {

  socket.on('join-room', ({ username, room }) => {
    //Each user gets a unique socket.id
    const user=userJoin(username,socket.id,room);
    socket.join(user.room);
    socket.broadcast.to(user.room).emit('user-joined', {name: username, room: room});
      //sends event to every client except the emitting client
    const roomusers=getRoomusers(user.room);
    io.to(user.room).emit("update-users",roomusers);
    socket.on('not-typing', () => {
        const user=getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('not-typing',username);
    });
  });

  // socket.broadcast.emit('room-users', {room: room_, all_users: all_users});

  socket.on('new-chat-message', (message) => {

      let currentDate = new Date();
      let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
      const user=getCurrentUser(socket.id);
      socket.broadcast.to(user.room).emit('receive', {message: message, name:user.username, time: time});
  });

  socket.on('is-typing', username =>{
    const user=getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit('is-typing', username);
  });

  socket.on('disconnect', () => {
    const user=userLeave(socket.id);
    console.log(user);
    const roomusers=getRoomusers(user.room);
    socket.broadcast.to(user.room).emit("update-users",roomusers);
    socket.broadcast.to(user.room).emit('user-left',user.username);
  });
  socket.on("image upload",(file)=>{
      const user=getCurrentUser(socket.id);
      console.log(file);
      socket.broadcast.to(user.room).emit("image download",{username:file.username,filename:file.filename,fieldname:file.fieldname});
  })
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.send({
            success: false,
            message: "No file uploaded"
        });
    } else {
        return res.send({
            success: true,
            message: "File uploaded successfully",
            file: req.file
        });
    }
});
server.listen(process.env.PORT||3000, () => {
  console.log('listening on port: 3000');
});
