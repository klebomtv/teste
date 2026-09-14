// caminho: public/painel/js/panel.js

import {
    setupGroups,
    updateGroupsConnection
} from './groups.js'

import {
    setupMessages,
    updateMessagesConnection
} from './messages.js'


const socket = io()


const connectionStatus =
    document.getElementById(
        'connection-status'
    )


const connectionDot =
    document.getElementById(
        'connection-dot'
    )


/*
 * ==========================================
 * CONEXÃO
 * ==========================================
 */

function setConnectionStatus(
    connected
) {

    if (connected) {

        connectionStatus.textContent =
            'Connected'

        connectionDot.classList.add(
            'connected'
        )

    } else {

        connectionStatus.textContent =
            'Disconnected'

        connectionDot.classList.remove(
            'connected'
        )

    }


    updateGroupsConnection(
        connected
    )


    updateMessagesConnection(
        connected
    )

}


/*
 * ==========================================
 * SOCKET CONECTADO
 * ==========================================
 */

socket.on(
    'connect',
    () => {

        console.log(
            '[PAINEL] Socket conectado:',
            socket.id
        )


        console.log(
            '[PAINEL] Transport:',
            socket.io.engine.transport.name
        )


        setConnectionStatus(
            true
        )

    }
)


/*
 * ==========================================
 * SOCKET DESCONECTADO
 * ==========================================
 */

socket.on(
    'disconnect',
    reason => {

        console.error(
            '[PAINEL] Socket desconectado:',
            reason
        )


        setConnectionStatus(
            false
        )

    }
)


/*
 * ==========================================
 * ERRO DE CONEXÃO
 * ==========================================
 */

socket.on(
    'connect_error',
    error => {

        console.error(
            '[PAINEL] Erro Socket.IO:',
            error
        )


        connectionStatus.textContent =
            'Connection error'

    }
)


/*
 * ==========================================
 * ERRO DE AUTENTICAÇÃO
 * ==========================================
 */

socket.on(
    'auth-error',
    data => {

        console.error(
            '[PAINEL] Erro de autenticação:',
            data
        )


        connectionStatus.textContent =
            'Authentication error'

    }
)


/*
 * ==========================================
 * INICIALIZAÇÃO DOS MÓDULOS
 * ==========================================
 */

setupGroups(
    socket
)


setupMessages(
    socket
)