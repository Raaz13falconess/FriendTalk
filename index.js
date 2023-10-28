const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userModel = require("./models/userModel");

const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.mongodb_uri;

const connectDatabase = async() => {
    try {
        mongoose.connect(uri);
        console.log("Database connected");
    } catch (error) {
        console.log(error.message);
    }
}

connectDatabase();

const http = require("http").Server(app);

const userRoute = require("./routes/userRoutes");
app.use("/", userRoute.user_route);

const io = require("socket.io")(http)

var usp = io.of('/user-namespace');

usp.on('connection', async (socket)=> {
    console.log(`user connected`);

    var userId = socket.handshake.auth.token;
    await userModel.findByIdAndUpdate({_id : userId}, {$set : {is_online : '1'}});

    socket.broadcast.emit('getOnlineUser', {user_id : userId});

    socket.on('disconnect', async ()=> {
        console.log(`user disconnected`);
        var userId = socket.handshake.auth.token;
        await userModel.findByIdAndUpdate({_id : userId}, {$set : {is_online : '0'}});

        socket.broadcast.emit('getOfflineUser', {user_id : userId});
    });
    socket.on('newChat', (data)=> {
        socket.broadcast.emit('loadNewChat', data);
    })
})

const port = 3000 || process.env.PORT;
http.listen(port, ()=> {
    console.log(`Server is running on port: ${port}`);
})