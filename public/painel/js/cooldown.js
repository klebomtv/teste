
// caminho: public/painel/js/cooldown.js

const COOLDOWN_TIME =
    30

let cooldownActive =
    false

let cooldownTimer =
    null

let remainingTime =
    0


function isCooldownActive() {

    return cooldownActive

}


function startCooldown(
    seconds = COOLDOWN_TIME
) {

    clearCooldown()

    cooldownActive =
        true

    remainingTime =
        seconds

    updateCooldownDisplay()

    cooldownTimer =
        setInterval(
            () => {

                remainingTime--

                updateCooldownDisplay()

                if (
                    remainingTime <= 0
                ) {

                    clearCooldown()

                }

            },
            1000
        )

}


function clearCooldown() {

    if (
        cooldownTimer
    ) {

        clearInterval(
            cooldownTimer
        )

        cooldownTimer =
            null

    }

    cooldownActive =
        false

    remainingTime =
        0

    updateCooldownDisplay()

}


function updateCooldownDisplay() {

    const cooldown =
        document.getElementById(
            'cooldown'
        )

    const cooldownTime =
        document.getElementById(
            'cooldown-time'
        )


    if (
        !cooldown ||
        !cooldownTime
    ) {

        return

    }


    if (
        cooldownActive
    ) {

        cooldown.style.display =
            'block'

        cooldownTime.textContent =
            `${remainingTime}s`

        return

    }


    cooldown.style.display =
        'none'

}


window.panelCooldown = {

    isActive:
        isCooldownActive,

    start:
        startCooldown,

    clear:
        clearCooldown

}

