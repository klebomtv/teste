// caminho: public/js/socket.js

export const socket =
    io({
        autoConnect: false
    })

socket.on(
    'connect',
    () => {
        console.log(
            '[SOCKET CLIENT] Conectado:',
            socket.id
        )
    }
)

socket.on(
    'connect_error',
    error => {
        console.error(
            '[SOCKET CLIENT] Erro de conexão:',
            error.message
        )
    }
)

socket.on(
    'disconnect',
    reason => {
        console.warn(
            '[SOCKET CLIENT] Desconectado:',
            reason
        )
    }
)