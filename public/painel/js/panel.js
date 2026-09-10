
// caminho: public/painel/js/panel.js

const socket =
    io()


const panelStatus =
    document.getElementById(
        'panel-status'
    )


/*
 * ==========================================
 * SOCKET CONECTADO
 * ==========================================
 */

socket.on(
    'connect',
    () => {

        console.log(
            '[PAINEL] Socket conectado.'
        )


        console.log(
            '[PAINEL] Solicitando grupos.'
        )


        socket.emit(
            'request-groups'
        )

    }
)


/*
 * ==========================================
 * ESTADO DO WHATSAPP
 * ==========================================
 */

socket.on(
    'whatsapp-state',
    state => {

        console.log(
            '[PAINEL] Estado recebido:',
            state
        )


        if (
            !state
        ) {

            return

        }


        if (
            panelStatus &&
            state.status
        ) {

            panelStatus.textContent =
                state.status

        }


        if (
            Array.isArray(
                state.groups
            )
        ) {

            console.log(
                '[PAINEL] Grupos no estado:',
                state.groups.length
            )


            panelGroups.set(
                state.groups
            )

        }

    }
)


/*
 * ==========================================
 * RECEBER GRUPOS
 * ==========================================
 */

socket.on(
    'groups',
    groups => {

        console.log(
            '[PAINEL] Grupos recebidos:',
            groups
        )


        if (
            !Array.isArray(
                groups
            )
        ) {

            return

        }


        panelGroups.set(
            groups
        )

    }
)


/*
 * ==========================================
 * STATUS WHATSAPP
 * ==========================================
 */

socket.on(
    'connected',
    connected => {

        console.log(
            '[PAINEL] WhatsApp:',
            connected
                ? 'conectado'
                : 'desconectado'
        )


        if (
            panelStatus
        ) {

            panelStatus.textContent =
                connected
                    ? 'WhatsApp conectado.'
                    : 'WhatsApp desconectado.'

        }

    }
)


console.log(
    '[PAINEL] Painel carregado.'
)

