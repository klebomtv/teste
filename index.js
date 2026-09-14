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


const {
    requireAuth
} =
    require('./src/auth/middleware')


/*
 * ==========================================
 * INICIALIZAÇÃO
 * ==========================================
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
 * ==========================================
 * AUTENTICAÇÃO
 * ==========================================
 */

const auth =
    setupAuthRoutes(
        app
    )


/*
 * ==========================================
 * ARQUIVOS PÚBLICOS
 * ==========================================
 *
 * Login, 404 e página inicial
 * continuam disponíveis.
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


/*
 * ==========================================
 * PROTEÇÃO DO PAINEL
 * ==========================================
 */

app.use(
    '/painel',
    requireAuth(
        auth
    )
)


/*
 * ==========================================
 * PÁGINA DO PAINEL
 * ==========================================
 */

app.get(
    '/painel/',
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                'public',
                'painel',
                'index.html'
            )
        )

    }
)


/*
 * ==========================================
 * WHATSAPP
 * ==========================================
 */

const whatsapp =
    createWhatsApp()


/*
 * ==========================================
 * SOCKET.IO
 * ==========================================
 *
 * O Socket.IO agora fica responsável
 * somente pela comunicação necessária
 * entre navegador e servidor.
 */

setupSocket(
    io,
    auth
)


/*
 * ==========================================
 * 404
 * ==========================================
 *
 * Deve ficar por último.
 */

app.use(
    (req, res) => {

        res.status(
            404
        )


        res.sendFile(
            path.join(
                __dirname,
                'public',
                '404',
                'index.html'
            )
        )

    }
)


/*
 * ==========================================
 * SERVIDOR
 * ==========================================
 */

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