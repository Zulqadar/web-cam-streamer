const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const httpServer = http.createServer(app);

const session=require("express-session");
const bodyParser=require("body-parser");
const router=express.Router();

const PORT = process.env.PORT || 3000;

const wsServer = new WebSocket.Server({ server: httpServer }, () => console.log(`WS server is listening at ws://localhost:${WS_PORT}`));

// array of connected websocket clients
let connectedClients = [];

wsServer.on('connection', (ws, req) => {
    console.log('Connected');
    // add new connected client
    connectedClients.push(ws);
    // listen for messages from the streamer, the clients will not send anything so we don't need to filter
    ws.on('message', data => {
        // send the base64 encoded frame to each connected ws
        connectedClients.forEach((ws, i) => {
            if (ws.readyState === ws.OPEN) { // check if it is still connected
                ws.send(data); // send
            } else { // if it's not connected remove from the array of connected ws
                connectedClients.splice(i, 1);
            }
        });
    });
});

app.use(session({secret:'abcdefgh',saveUninitialized:true,resave:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var sess;

// HTTP stuff
app.get('/client', (req, res) => 
{
    sess=req.session;
    if(sess.clientKey){
        res.sendFile(path.resolve(__dirname, './client.html'))
    }else{
        res.sendFile(path.resolve(__dirname,'./index.html'));
    }
    
});

app.get('/streamer', (req, res) => {
    sess=req.session;
    if(sess.streamerKey){
        res.sendFile(path.resolve(__dirname, './streamer.html'))
    }else
    {
        res.sendFile(path.resolve(__dirname,'./admin.html'));
    }    
});

app.post('/',(req,res)=>{
    sess=req.session;
    sess.clientKey=req.body.clientKey;
    if(sess.clientKey=='zull'){
        res.redirect('/client');
    }else{
        res.redirect('/');
    }
})

app.post('/admin',(req,res)=>{
    sess=req.session;
    sess.streamerKey=req.body.streamerKey;
    if(sess.streamerKey=='admin'){
        res.redirect('/streamer');
    }else{
        res.redirect('/admin');
    }
})

app.get('/admin',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'./admin.html'));
})

app.get('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
        }

        res.redirect('/');
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname,'./index.html'));
});

httpServer.listen(PORT, () => console.log(`HTTP server listening at http://localhost:${PORT}`));