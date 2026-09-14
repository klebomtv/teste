
// caminho: public/painel/js/panel.js

const socket =
    window.panelSocket


const panelStatus =
    document.getElementById(
        'panel-status'
    )


/*
 * ==========================================
 * VALIDAR SOCKET
 * ==========================================
 */

if (
    !socket
) {

    console.error(
        '[PAINEL] Socket do painel não encontrado.'
    )

} else {


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

                console.error(
                    '[PAINEL] Grupos recebidos não são um array.'
                )

                return

            }


            console.log(
                '[PAINEL] Total de grupos recebidos:',
                groups.length
            )


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

}


console.log(
    '[PAINEL] Painel carregado.'
)

