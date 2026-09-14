
// caminho: public/painel/js/cooldown.js

let cooldown = false
let cooldownTimer = null


export function startCooldown(
    seconds,
    button
) {

    /*
     * ==========================================
     * VALIDAÇÃO
     * ==========================================
     */

    if (!button) {

        console.warn(
            '[COOLDOWN] Botão de envio não encontrado.'
        )

        return
    }


    /*
     * ==========================================
     * LIMPA COOLDOWN ANTERIOR
     * ==========================================
     */

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
        'Aguarde ' +
        remaining +
        's'


    /*
     * ==========================================
     * CONTADOR
     * ==========================================
     */

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

                    return
                }


                button.textContent =
                    'Aguarde ' +
                    remaining +
                    's'

            },
            1000
        )

}


/*
 * ==========================================
 * VERIFICA COOLDOWN
 * ==========================================
 */

export function isCooldown() {

    return cooldown

}

