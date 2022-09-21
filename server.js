//bring in modules
const path = require('path');
const http = require('http');
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers, getUserSocketID } = require('./utils/users')

//bring in express and socket.io
const express = require('express');
const socketio = require('socket.io');

//create a web app
const app = express();

//Create a http server object
const server = http.createServer(app);

//create a socketio object for the server
const io = socketio(server);

const botName = 'server';

//set static folder
app.use(express.static(path.join(__dirname,'public')));

//run when a client connects
io.on('connection', socket => {
    //console.log('New websocket connection!');

    socket.on('joinRoom', ({ username, room}) => {

        //create a user
        const user = userJoin(socket.id, username, room );

        //join the room 
        socket.join(user.room);

        socket.emit('message',formatMessage(botName,'Welcome to chat app'));
        
        //broadcast when a user is connected
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chatroom`));
        
        //update the users and room info 
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });


    //listen for  chat messages
    socket.on('chatMessage', ({ msg, mulusers }) => {
        
        if(mulusers.length != 0){
            var multiUsers = mulusers.split(',');
            var num = multiUsers.length;

            const user = getCurrentUser(socket.id);
            io.to(user.id).emit('message', formatMessage(user.username,msg));  

            for(var i=0;i<num;i++){
                var sock = getUserSocketID(multiUsers[i]);
                io.to(sock).emit('message', formatMessage(user.username,msg));
            }
        }else{
            const user = getCurrentUser(socket.id);
            io.to(user.room).emit('message', formatMessage(user.username,msg));     
        }
        
    });

    //listen for image and send it over clients
    socket.on("image", ({imgData,mulusers}) =>{

        if(mulusers.length != 0){
            var multiUsers = mulusers.split(',');
            var num = multiUsers.length;

            for(var i=0;i<num;i++){
                var sock = getUserSocketID(multiUsers[i]);
                io.to(sock).emit("image",imgData); 
            }
        }else{
            const user = getCurrentUser(socket.id);
            socket.broadcast.emit("image",imgData);
        }
    });

    //Runs when a user got disconnected
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
            //update the usrs and room
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
        
    });
})

//port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
