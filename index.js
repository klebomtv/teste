
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


const createMessageSystem =
    require('./src/painel/messages')


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
 * Sistema de autenticação
 * do painel.
 */

const auth =
    setupAuthRoutes(
        app
    )


/*
 * Proteção das rotas
 * do painel.
 *
 * Tudo que estiver dentro
 * de /painel será protegido.
 */

app.use(
    '/painel',
    requireAuth(
        auth
    )
)


/*
 * Arquivos públicos.
 *
 * Os arquivos do painel já passaram
 * pela proteção acima.
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
 * Página do painel.
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
 * Sistema WhatsApp.
 *
 * Toda a lógica está
 * dentro de src/whatsapp/.
 */

const whatsapp =
    createWhatsApp(
        io
    )


/*
 * Sistema de mensagens
 * do painel.
 *
 * Responsável pela fila,
 * intervalo entre grupos
 * e proteção contra múltiplos envios.
 */

const messages =
    createMessageSystem(
        whatsapp,
        io
    )


/*
 * Socket.IO.
 *
 * Responsável pela comunicação
 * entre navegador e servidor.
 */

setupSocket(
    io,
    whatsapp,
    auth,
    messages
)


/*
 * ==========================================
 * PÁGINA 404
 * ==========================================
 *
 * Este middleware precisa ficar
 * depois de todas as rotas.
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

