
// caminho: public/painel/js/panel.js

const panelStatus =
    document.getElementById(
        'panel-status'
    )

const panelSocket =
    window.panelSocket

function updateStatus(
    text
) {

    if (
        panelStatus
    ) {

        panelStatus.textContent =
            text
    }
}

function requestGroups() {

    if (
        !panelSocket
    ) {

        console.error(
            '[PAINEL] Socket não encontrado.'
        )

        return
    }

    console.log(
        '[PAINEL] Solicitando grupos.'
    )

    panelSocket.emit(
        'request-groups'
    )
}

if (
    !panelSocket
) {

    console.error(
        '[PAINEL] window.panelSocket não existe.'
    )

} else {

    console.log(
        '[PAINEL] Socket encontrado.'
    )

    panelSocket.on(
        'connect',
        () => {

            console.log(
                '[PAINEL] Socket conectado.'
            )

            requestGroups()
        }
    )

    panelSocket.on(
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
                state.status
            ) {

                updateStatus(
                    state.status
                )
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

                if (
                    window.panelGroups
                ) {

                    window.panelGroups.set(
                        state.groups
                    )
                }
            }
        }
    )

    panelSocket.on(
        'groups',
        groups => {

            console.log(
                '[PAINEL] Evento groups recebido.'
            )

            if (
                !Array.isArray(
                    groups
                )
            ) {

                console.error(
                    '[PAINEL] Grupos não são um array.'
                )

                return
            }

            console.log(
                '[PAINEL] Total de grupos:',
                groups.length
            )

            if (
                window.panelGroups
            ) {

                window.panelGroups.set(
                    groups
                )
            }
        }
    )

    panelSocket.on(
        'connected',
        connected => {

            console.log(
                '[PAINEL] WhatsApp:',
                connected
                    ? 'conectado'
                    : 'desconectado'
            )

            updateStatus(
                connected
                    ? 'WhatsApp conectado.'
                    : 'WhatsApp desconectado.'
            )
        }
    )

    /*
     * Caso o socket já esteja conectado
     * antes deste arquivo ser executado.
     */

    if (
        panelSocket.connected
    ) {

        console.log(
            '[PAINEL] Socket já conectado.'
        )

        requestGroups()
    }
}

console.log(
    '[PAINEL] Painel carregado.'
)

