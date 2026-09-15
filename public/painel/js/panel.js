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
    '[PANEL] panel.js carregado.'
)


const socket =
    io()


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
 * ==========================================
 * CONFIGURAR MÓDULOS
 * ==========================================
 */

setupGroups(
    socket
)


setupMessages(
    socket
)


/*
 * ==========================================
 * STATUS DA CONEXÃO
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
            '[PANEL] Socket conectado:',
            socket.id
        )


        console.log(
            '[PANEL] Transport:',
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

        console.warn(
            '[PANEL] Socket desconectado:',
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
            '[PANEL] Erro Socket.IO:',
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
            '[PANEL] Erro de autenticação:',
            data
        )


        connectionStatus.textContent =
            'Authentication error'

    }
)


/*
 * ==========================================
 * DISCONNECT
 * ==========================================
 *
 * Por enquanto este botão desconecta
 * somente o Socket.IO do painel.
 *
 * NÃO desconecta o WhatsApp.
 *
 */

if (disconnectButton) {

    disconnectButton.addEventListener(
        'click',
        () => {

            console.log(
                '[PANEL] Botão Disconnect clicado.'
            )


            socket.disconnect()

        }
    )

}