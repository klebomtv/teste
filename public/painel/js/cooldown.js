// caminho: public/painel/js/cooldown.js

let cooldown = false

let cooldownTimer = null


export function startCooldown(
    seconds,
    button
) {

    if (!button) {

        console.warn(
            '[COOLDOWN] Botão de envio não encontrado.'
        )

        return

    }


    clearInterval(
        cooldownTimer
    )


    cooldown =
        true


    button.disabled =
        true


    let remaining =
        Number(seconds)


    if (
        !Number.isFinite(remaining) ||
        remaining < 0
    ) {

        remaining =
            0

    }


    button.textContent =
        `Aguarde ${remaining}s`


    cooldownTimer =
        setInterval(
            () => {

                remaining--


                if (
                    remaining <= 0
                ) {

                    clearInterval(
                        cooldownTimer
                    )


                    cooldownTimer =
                        null


                    cooldown =
                        false


                    button.disabled =
                        false


                    button.textContent =
                        'Enviar mensagem'


                    document.dispatchEvent(
                        new CustomEvent(
                            'cooldown-finished'
                        )
                    )


                    return

                }


                button.textContent =
                    `Aguarde ${remaining}s`

            },
            1000
        )

}


export function isCooldown() {

    return cooldown

}