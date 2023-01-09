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
var numero = 0;
var pausa = false
var reanudar = false;
var i = 0;

function intervaloContador() {
    if (pausa == false) {
        if(reanudar == false){
            numero = contadorServer[i].duracion
            console.log("Entro")
        }else{
            reanudar = false
        }
        intervalo = setInterval(() => {
            if (numero != 0) {
                numero = numero - 1;
                console.log({ inicio: contadorServer[i].inicio, contador: numero })
                io.emit("cont", { inicio: contadorServer[i].inicio, contador: numero })
            } else {
                i++;
                console.log(contadorServer[i])
                clearInterval(intervalo)
                if (i < contadorServer.length) {
                    intervaloContador();
                }
            }
        }, 1000)
    } else {
        pausa = false
        clearInterval(intervalo)
    }
}


io.on("connection", (socket) => {
    socket.on('contador', function (contador) {
        // if (Array.isArray(contador)) {
        //     console.log(contador)
        //     contadorServer = contador
        //     intervaloContador();
        // }

        pausa = false
        reanudar = false
        contadorServer = contador
        intervaloContador();

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

    socket.on('pausa', function (str) {
        console.log("entro")
        pausa = true
        reanudar = false
        intervaloContador();
    })

    socket.on('reanudar', function (str) {
        pausa = false
        reanudar = true
        intervaloContador();
    })

})

app.get('/', (req, res) => {
  res.send("El servidor esta corriendo")
})

server.listen(PORT)
console.log("Server started on port " + PORT)