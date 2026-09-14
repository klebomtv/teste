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
    require('./src/whatsapp/index')

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
 * INICIALIZAÇÃO DO SISTEMA
 * ==========================================
 */

initializeSystem()


/*
 * ==========================================
 * EXPRESS
 * ==========================================
 */

const app =
    express()

const server =
    http.createServer(
        app
    )


/*
 * ==========================================
 * SOCKET.IO
 * ==========================================
 */

const io =
    new Server(
        server
    )


/*
 * ==========================================
 * PORTA
 * ==========================================
 */

const PORT =
    Number(
        process.env.PORT || 3000
    )


/*
 * ==========================================
 * JSON
 * ==========================================
 */

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
 * PROTEÇÃO DO PAINEL
 * ==========================================
 *
 * Tudo que estiver dentro de /painel
 * passa primeiro pela autenticação.
 */

app.use(
    '/painel',
    requireAuth(
        auth
    )
)


/*
 * ==========================================
 * ARQUIVOS PÚBLICOS
 * ==========================================
 *
 * /login
 * /
 * /404
 * /qr.png
 * e demais arquivos públicos.
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
    createWhatsApp(
        io
    )


/*
 * ==========================================
 * SOCKET.IO
 * ==========================================
 */

setupSocket(
    io,
    whatsapp,
    auth
)


/*
 * ==========================================
 * 404
 * ==========================================
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