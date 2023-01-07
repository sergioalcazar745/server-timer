import express from "express";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import http from "http";
import cors from "cors";
import { PORT } from "./config.js";

const app = express()
const server = http.createServer(app)
const io = new SocketServer(server, {
    cors: {
        origin: '*'
    }
})

app.use(cors())
app.use(morgan('dev'))
var intervalo = "";
var contadorServer = [];
var i = 0;

function intervaloContador(){
    var numero = contadorServer[i].duracion
    intervalo = setInterval(() => {
        if (numero != 0) {
            numero = numero - 1;
            io.emit("cont", { numero: numero, hora: contadorServer[i].inicio })
        } else {
            i ++;
            clearInterval(intervalo)
            if(i < contadorServer.length){                
                intervaloContador();
            }            
        }
    }, 1000)
}


io.on("connection", (socket) => {
    socket.on('contador', function (contador) {
        if (Array.isArray(contador)) {
            contadorServer = contador
            intervaloContador();
        }
        // if(contador != "pausa"){
        //     var numero = contador
        //     intervalo = setInterval(() => {
        //         if(numero != 0){
        //             numero = numero - 1;
        //             io.emit("cont", numero)
        //         }else{
        //             clearInterval(intervalo)
        //         }          
        //     } ,1000)
        // }else{
        //     clearInterval(intervalo)
        // }
    })

})

server.listen(PORT)
console.log("Server started on port " + PORT)