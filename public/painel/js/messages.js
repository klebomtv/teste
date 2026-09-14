
// caminho: public/painel/js/messages.js

const socket =
    io()


window.panelSocket =
    socket


const messageInput =
    document.getElementById(
        'message'
    )


const sendButton =
    document.getElementById(
        'send-message'
    )


const sendStatus =
    document.getElementById(
        'send-status'
    )


let sending =
    false


function setSending(
    value
) {

    sending =
        value

    if (
        sendButton
    ) {

        sendButton.disabled =
            value

    }

}


function sendMessage() {

    if (
        sending
    ) {

        return

    }


    if (
        panelCooldown.isActive()
    ) {

        return

    }


    const message =
        messageInput.value.trim()


    if (
        !message
    ) {

        setStatus(
            'Digite uma mensagem.'
        )

        return

    }


    const selectedGroups =
        panelGroups.getSelected()


    if (
        selectedGroups.length === 0
    ) {

        setStatus(
            'Selecione pelo menos um grupo.'
        )

        return

    }


    setSending(
        true
    )


    setStatus(
        'Iniciando envio...'
    )


    socket.emit(
        'send-message',
        {
            message,

            groups:
                selectedGroups.map(
                    group =>
                        group.id
                )
        }
    )

}


function setStatus(
    text
) {

    if (
        sendStatus
    ) {

        sendStatus.textContent =
            text

    }

}


socket.on(
    'send-result',
    result => {

        setSending(
            false
        )


        if (
            !result ||
            !result.success
        ) {

            setStatus(
                result?.message ||
                'Não foi possível enviar a mensagem.'
            )

            return

        }


        setStatus(
            result.message ||
            'Mensagem enviada.'
        )


        panelCooldown.start()

    }
)


socket.on(
    'send-progress',
    progress => {

        if (
            !progress
        ) {

            return

        }


        if (
            progress.current &&
            progress.total
        ) {

            setStatus(
                `Enviando para ${progress.current} de ${progress.total} grupos...`
            )

        }

    }
)


socket.on(
    'send-finished',
    result => {

        setSending(
            false
        )


        if (
            result?.message
        ) {

            setStatus(
                result.message
            )

        }

    }
)


if (
    sendButton
) {

    sendButton.addEventListener(
        'click',
        sendMessage
    )

}


window.panelMessages = {

    isSending:
        () => sending

}


console.log(
    '[PAINEL MESSAGES] Módulo de mensagens carregado.'
)

