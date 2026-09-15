// caminho: public/painel/js/panel.js

console.log(
    '[PANEL] ===== INÍCIO DO panel.js ====='
)


import {
    setupGroups,
    updateGroupsConnection
} from './groups.js'


console.log(
    '[PANEL] groups.js importado com sucesso.'
)


import {
    setupMessages,
    updateMessagesConnection
} from './messages.js'


console.log(
    '[PANEL] messages.js importado com sucesso.'
)


const socket =
    io()


console.log(
    '[PANEL] Socket.IO criado.'
)


console.log(
    '[PANEL] socket.connected:',
    socket.connected
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


console.log(
    '[PANEL] Elementos encontrados:',
    {
        connectionStatus: Boolean(
            connectionStatus
        ),

        connectionDot: Boolean(
            connectionDot
        ),

        disconnectButton: Boolean(
            disconnectButton
        )
    }
)


function setConnectionStatus(
    connected
) {

    console.log(
        '[PANEL] Alterando status de conexão:',
        connected
    )


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


    console.log(
        '[PANEL] Atualizando conexão dos grupos.'
    )


    updateGroupsConnection(
        connected
    )


    console.log(
        '[PANEL] Atualizando conexão das mensagens.'
    )


    updateMessagesConnection(
        connected
    )

}


socket.on(
    'connect',
    () => {

        console.log(
            '[PANEL] ============================='
        )

        console.log(
            '[PANEL] SOCKET CONECTADO'
        )

        console.log(
            '[PANEL] Socket ID:',
            socket.id
        )

        console.log(
            '[PANEL] Transport:',
            socket.io.engine.transport.name
        )

        console.log(
            '[PANEL] ============================='
        )


        setConnectionStatus(
            true
        )

    }
)


socket.on(
    'disconnect',
    reason => {

        console.error(
            '[PANEL] SOCKET DESCONECTADO'
        )

        console.error(
            '[PANEL] Motivo:',
            reason
        )


        setConnectionStatus(
            false
        )

    }
)


socket.on(
    'connect_error',
    error => {

        console.error(
            '[PANEL] SOCKET CONNECT ERROR'
        )

        console.error(
            '[PANEL] Mensagem:',
            error.message
        )

        console.error(
            '[PANEL] Erro completo:',
            error
        )


        if (connectionStatus) {

            connectionStatus.textContent =
                'Connection error'

        }

    }
)


socket.on(
    'auth-error',
    data => {

        console.error(
            '[PANEL] AUTH ERROR:',
            data
        )


        if (connectionStatus) {

            connectionStatus.textContent =
                'Authentication error'

        }

    }
)


console.log(
    '[PANEL] Configurando grupos...'
)


setupGroups(
    socket
)


console.log(
    '[PANEL] Grupos configurados.'
)


console.log(
    '[PANEL] Configurando mensagens...'
)


setupMessages(
    socket
)


console.log(
    '[PANEL] Mensagens configuradas.'
)


if (disconnectButton) {

    disconnectButton.addEventListener(
        'click',
        () => {

            console.log(
                '[PANEL] Botão Disconnect clicado.'
            )

            console.log(
                '[PANEL] Socket antes:',
                socket.connected
            )


            socket.disconnect()


            console.log(
                '[PANEL] Socket depois:',
                socket.connected
            )

        }
    )

}


console.log(
    '[PANEL] ===== FIM DA INICIALIZAÇÃO ====='
)