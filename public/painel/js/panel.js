
// caminho: public/painel/js/panel.js

console.log(
    '[PAINEL] Nova interface carregada.'
)


const socket =
    io()


const connectionStatus =
    document.getElementById(
        'connection-status'
    )


const whatsappStatus =
    document.getElementById(
        'whatsapp-status'
    )


const systemStatus =
    document.getElementById(
        'system-status'
    )


socket.on(
    'connect',
    () => {

        console.log(
            '[PAINEL] Socket conectado.',
            socket.id
        )


        connectionStatus.textContent =
            'Socket conectado.'

        systemStatus.textContent =
            'Painel conectado ao servidor.'

    }
)


socket.on(
    'connect_error',
    error => {

        console.error(
            '[PAINEL] Erro no Socket:',
            error
        )


        connectionStatus.textContent =
            'Erro na conexão.'

    }
)


socket.on(
    'disconnect',
    () => {

        console.log(
            '[PAINEL] Socket desconectado.'
        )


        connectionStatus.textContent =
            'Socket desconectado.'

    }
)


whatsappStatus.textContent =
    'Aguardando conexão do WhatsApp.'

