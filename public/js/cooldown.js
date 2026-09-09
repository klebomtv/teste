// caminho: public/js/cooldown.js

let cooldown = false
let cooldownTimer = null

export function startCooldown(
    seconds,
    button
) {

    clearInterval(cooldownTimer)

    cooldown = true

    button.disabled = true

    let remaining =
        Number(seconds)

    button.textContent =
        'Aguarde ' + remaining + 's'


    cooldownTimer = setInterval(() => {

        remaining--


        if (remaining <= 0) {

            clearInterval(
                cooldownTimer
            )

            cooldown = false

            button.disabled = false

            button.textContent =
                'Enviar mensagem'

            return
        }


        button.textContent =
            'Aguarde ' + remaining + 's'

    }, 1000)
}


export function isCooldown() {
    return cooldown
}