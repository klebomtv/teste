// caminho: public/js/connection.js

export function setupConnection(
    socket
) {

    console.log(
        '[CONNECTION] connection.js foi carregado.'
    )


    const connectionPage =
        document.getElementById(
            'connection-page'
        )

    const panelPage =
        document.getElementById(
            'panel-page'
        )

    const status =
        document.getElementById(
            'status'
        )

    const qrContainer =
        document.getElementById(
            'qr-container'
        )

    const qr =
        document.getElementById(
            'qr'
        )

    const startButton =
        document.getElementById(
            'start-whatsapp'
        )

    const logoutButton =
        document.getElementById(
            'logout'
        )


    console.log(
        '[CONNECTION] Elementos encontrados:',
        {
            connectionPage:
                !!connectionPage,

            panelPage:
                !!panelPage,

            status:
                !!status,

            qrContainer:
                !!qrContainer,

            qr:
                !!qr,

            startButton:
                !!startButton,

            logoutButton:
                !!logoutButton
        }
    )


    if (
        !connectionPage ||
        !panelPage ||
        !status ||
        !qrContainer ||
        !qr ||
        !startButton
    ) {

        console.error(
            '[CONNECTION] ERRO: algum elemento obrigatório não foi encontrado no HTML.'
        )

        return
    }


    console.log(
        '[CONNECTION] Botão "Iniciar WhatsApp" encontrado:',
        startButton
    )


    /*
     * Botão "Iniciar WhatsApp".
     */

    startButton.addEventListener(
        'click',
        () => {

            console.log(
                '========================================'
            )

            console.log(
                '[BOTÃO] INICIAR WHATSAPP FOI CLICADO'
            )

            console.log(
                '[BOTÃO] Socket conectado:',
                socket.connected
            )

            console.log(
                '[BOTÃO] Socket ID:',
                socket.id
            )

            console.log(
                '[BOTÃO] Socket:',
                socket
            )

            console.log(
                '========================================'
            )


            if (
                !socket.connected
            ) {

                console.error(
                    '[BOTÃO] ERRO: Socket.IO não está conectado.'
                )

                status.textContent =
                    'Erro: conexão com o servidor não está disponível.'

                return
            }


            startButton.disabled =
                true

            startButton.textContent =
                'Iniciando...'

            status.textContent =
                'Iniciando WhatsApp...'


            console.log(
                '[BOTÃO] Enviando evento "start-whatsapp"...'
            )


            try {

                socket.emit(
                    'start-whatsapp'
                )


                console.log(
                    '[BOTÃO] Evento "start-whatsapp" enviado com sucesso.'
                )

            } catch (error) {

                console.error(
                    '[BOTÃO] ERRO ao enviar "start-whatsapp":',
                    error
                )


                startButton.disabled =
                    false

                startButton.textContent =
                    'Iniciar WhatsApp'

                status.textContent =
                    'Erro ao iniciar o WhatsApp.'
            }
        }
    )


    console.log(
        '[CONNECTION] Evento de clique registrado no botão.'
    )


    /*
     * Logout.
     */

    if (
        logoutButton
    ) {

        logoutButton.addEventListener(
            'click',
            () => {

                console.log(
                    '[LOGOUT] Botão Logout clicado.'
                )


                const confirmed =
                    window.confirm(
                        'Deseja realmente fazer logout? A sessão do WhatsApp também será encerrada.'
                    )


                if (!confirmed) {

                    console.log(
                        '[LOGOUT] Logout cancelado pelo usuário.'
                    )

                    return
                }


                logoutButton.disabled =
                    true

                logoutButton.textContent =
                    'Saindo...'


                console.log(
                    '[LOGOUT] Enviando evento logout...'
                )


                socket.emit(
                    'logout'
                )
            }
        )
    }


    /*
     * Estado atual do WhatsApp.
     */

    socket.on(
        'whatsapp-state',
        state => {

            console.log(
                '[WHATSAPP STATE]',
                state
            )


            if (
                state.connected
            ) {

                showConnected()

                return
            }


            if (
                state.started
            ) {

                startButton.disabled =
                    true

                startButton.textContent =
                    'Aguardando conexão...'


                if (
                    state.qr
                ) {

                    qr.src =
                        `/qr.png?t=${Date.now()}`

                    qrContainer.style.display =
                        'block'

                    status.textContent =
                        'Escaneie o QR Code pelo WhatsApp.'

                    startButton.style.display =
                        'none'

                } else {

                    status.textContent =
                        state.status ||
                        'Aguardando conexão...'
                }


                return
            }


            showStopped()
        }
    )


    /*
     * WhatsApp começou a iniciar.
     */

    socket.on(
        'starting-whatsapp',
        () => {

            console.log(
                '[WHATSAPP] Servidor confirmou início.'
            )


            startButton.disabled =
                true

            startButton.textContent =
                'Iniciando...'

            status.textContent =
                'Iniciando WhatsApp...'
        }
    )


    /*
     * QR Code atualizado.
     */

    socket.on(
        'qr-updated',
        () => {

            console.log(
                '[WHATSAPP] QR Code atualizado.'
            )


            qr.src =
                `/qr.png?t=${Date.now()}`

            qrContainer.style.display =
                'block'

            status.textContent =
                'Escaneie o QR Code pelo WhatsApp.'

            startButton.style.display =
                'none'
        }
    )


    /*
     * Status.
     */

    socket.on(
        'status',
        currentStatus => {

            console.log(
                '[WHATSAPP] Status:',
                currentStatus
            )


            status.textContent =
                currentStatus
        }
    )


    /*
     * Conectado.
     */

    socket.on(
        'connected',
        connected => {

            console.log(
                '[WHATSAPP] Evento connected:',
                connected
            )


            if (
                !connected
            ) {

                showStopped()

                return
            }


            showConnected()
        }
    )


    /*
     * Resultado da inicialização.
     */

    socket.on(
        'start-result',
        result => {

            console.log(
                '[WHATSAPP] Resultado da inicialização:',
                result
            )


            if (
                result.success
            ) {

                status.textContent =
                    'WhatsApp iniciado.'

                return
            }


            startButton.disabled =
                false

            startButton.style.display =
                'block'

            startButton.textContent =
                'Iniciar WhatsApp'

            status.textContent =
                result.message ||
                'Não foi possível iniciar o WhatsApp.'
        }
    )


    /*
     * Resultado do logout.
     */

    socket.on(
        'logout-result',
        result => {

            console.log(
                '[LOGOUT] Resultado:',
                result
            )


            if (
                !result.success
            ) {

                if (
                    logoutButton
                ) {

                    logoutButton.disabled =
                        false

                    logoutButton.textContent =
                        'Logout'
                }


                alert(
                    result.message ||
                    'Erro ao fazer logout.'
                )

                return
            }


            window.location.href =
                '/'
        }
    )


    /*
     * Sessão do WhatsApp encerrada.
     */

    socket.on(
        'whatsapp-logged-out',
        () => {

            console.log(
                '[WHATSAPP] Sessão encerrada.'
            )
        }
    )


    /*
     * Exibe o painel conectado.
     */

    function showConnected() {

        console.log(
            '[UI] Mostrando painel conectado.'
        )


        connectionPage.style.display =
            'none'

        panelPage.style.display =
            'flex'
    }


    /*
     * Exibe a tela de conexão.
     */

    function showStopped() {

        console.log(
            '[UI] Mostrando tela de conexão.'
        )


        connectionPage.style.display =
            'flex'

        panelPage.style.display =
            'none'

        qrContainer.style.display =
            'none'

        startButton.style.display =
            'block'

        startButton.disabled =
            false

        startButton.textContent =
            'Iniciar WhatsApp'

        status.textContent =
            'WhatsApp está parado.'
    }
}