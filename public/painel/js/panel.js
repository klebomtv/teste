// caminho: public/painel/js/panel.js

import {
    setupGroups,
    updateGroupsConnection
} from './groups.js'


import {
    setupMessages,
    updateMessagesConnection
} from './messages.js'


console.log(
    '[PANEL] Iniciando painel.'
)


const socket =
    io()


console.log(
    '[PANEL] Socket criado:',
    socket.id
)


const connectionStatus =
    document.getElementById(
        'connection-status'
    )


const connectionDot =
    document.getElementById(
        'connection-dot'
    )


const disconnectButton =
    document.getElementById(
        'disconnect'
    )


/*
 * CONFIGURA OS MÓDULOS
 */

setupGroups(
    socket
)


setupMessages(
    socket
)


console.log(
    '[PANEL] Módulos configurados.'
)


/*
 * SOCKET CONECTADO
 */

socket.on(
    'connect',
    () => {

        console.log(
            '[PANEL] ======================='
        )


        console.log(
            '[PANEL] SOCKET CONECTADO'
        )


        console.log(
            '[PANEL] ID:',
            socket.id
        )


        console.log(
            '[PANEL] ======================='
        )


        connectionStatus.textContent =
            'Connected'


        connectionDot.classList.add(
            'connected'
        )


        updateGroupsConnection(
            true
        )


        updateMessagesConnection(
            true
        )

    }
)


/*
 * SOCKET DESCONECTADO
 */

socket.on(
    'disconnect',
    reason => {

        console.log(
            '[PANEL] SOCKET DESCONECTADO:',
            reason
        )


        connectionStatus.textContent =
            'Disconnected'


        connectionDot.classList.remove(
            'connected'
        )


        updateGroupsConnection(
            false
        )


        updateMessagesConnection(
            false
        )

    }
)


/*
 * ERRO DE CONEXÃO
 */

socket.on(
    'connect_error',
    error => {

        console.error(
            '[PANEL] CONNECT ERROR:',
            error.message
        )


        connectionStatus.textContent =
            'Connection error'

    }
)


/*
 * ERRO DE AUTENTICAÇÃO
 */

socket.on(
    'auth-error',
    data => {

        console.error(
            '[PANEL] AUTH ERROR:',
            data
        )


        connectionStatus.textContent =
            'Authentication error'

    }
)


/*
 * ESTADO DO WHATSAPP
 *
 * Colocamos também aqui um
 * listener direto.
 *
 * Assim conseguimos garantir
 * que os grupos sejam desenhados
 * mesmo que o módulo groups.js
 * tenha algum problema.
 */

socket.on(
    'whatsapp-state',
    state => {

        console.log(
            '[PANEL] WHATSAPP-STATE:',
            state
        )


        if (
            state &&
            Array.isArray(
                state.groups
            )
        ) {

            console.log(
                '[PANEL] Grupos recebidos:',
                state.groups.length
            )

        }

    }
)


/*
 * BOTÃO DISCONNECT
 */

if (disconnectButton) {

    disconnectButton.addEventListener(
        'click',
        () => {

            console.log(
                '[PANEL] Disconnect clicado.'
            )


            socket.disconnect()

        }
    )

}