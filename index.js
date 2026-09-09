// caminho: index.js

require('dotenv').config()


const express =
    require('express')


const http =
    require('http')


const path =
    require('path')


const { Server } =
    require('socket.io')


const initializeSystem =
    require('./src/startup')


const createWhatsApp =
    require('./src/whatsapp')


const setupSocket =
    require('./src/socket')


const setupAuthRoutes =
    require('./auth/routes')


/*
 * Preparação do sistema.
 *
 * Executado somente quando
 * o processo Node.js é iniciado.
 */

initializeSystem()


const app =
    express()


const server =
    http.createServer(
        app
    )


const io =
    new Server(
        server
    )


const PORT =
    Number(
        process.env.PORT || 3000
    )


app.use(
    express.json()
)


/*
 * Arquivos públicos.
 *
 * O acesso ao painel é controlado
 * pelas rotas de autenticação.
 */

app.use(
    express.static(
        path.join(
            __dirname,
            'public'
        ),
        {
            index: false
        }
    )
)


const auth =
    setupAuthRoutes(
        app
    )


const whatsapp =
    createWhatsApp(
        io
    )


setupSocket(
    io,
    whatsapp,
    auth
)


server.listen(
    PORT,
    () => {

        console.log(
            `Painel disponível em http://localhost:${PORT}`
        )


        console.log(
            'WhatsApp aguardando inicialização pelo painel.'
        )
    }
)