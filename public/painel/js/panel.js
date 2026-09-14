
// caminho: public/painel/js/panel.js

import {
    setupGroups
} from './groups.js'


import {
    setupMessages
} from './messages.js'


const socket =
    io()


/*
 * ==========================================
 * ELEMENTOS
 * ==========================================
 */

const connectionStatus =
    document.getElementById(
        'connection-status'
    )


const whatsappStatus =
    document.getElementById(
        'whatsapp-status'
    )


const logout =
    document.getElementById(
        'logout'
    )


/*
 * ==========================================
 * SOCKET
 * ==========================================
 */

socket.on(
    'connect',
    () => {

        if (connectionStatus) {

            connectionStatus.textContent =
                'Servidor conectado.'

        }

    }
)


socket.on(
    'disconnect',
    () => {

        if (connectionStatus) {

            connectionStatus.textContent =
                'Servidor desconectado.'

        }

    }
)


/*
 * ==========================================
 * WHATSAPP
 * ==========================================
 */

socket.on(
    'whatsapp-state',
    state => {

        if (!whatsappStatus) {
            return
        }


        if (
            state?.connected
        ) {

            whatsappStatus.textContent =
                'WhatsApp conectado.'

            return

        }


        if (
            state?.started
        ) {

            whatsappStatus.textContent =
                state.status ||
                'WhatsApp iniciando.'

            return

        }


        whatsappStatus.textContent =
            'WhatsApp desconectado.'

    }
)


socket.on(
    'starting-whatsapp',
    () => {

        if (whatsappStatus) {

            whatsappStatus.textContent =
                'Iniciando WhatsApp...'

        }

    }
)


socket.on(
    'connected',
    connected => {

        if (!whatsappStatus) {
            return
        }


        whatsappStatus.textContent =
            connected
                ? 'WhatsApp conectado.'
                : 'WhatsApp desconectado.'

    }
)


/*
 * ==========================================
 * MÓDULOS DO PAINEL
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
 * LOGOUT
 * ==========================================
 */

if (logout) {

    logout.addEventListener(
        'click',
        async () => {

            try {

                await fetch(
                    '/auth/logout',
                    {
                        method: 'POST',
                        credentials:
                            'same-origin'
                    }
                )


                window.location.href =
                    '/login/'

            } catch (error) {

                console.error(
                    '[PAINEL] Erro ao sair:',
                    error
                )

            }

        }
    )

}

