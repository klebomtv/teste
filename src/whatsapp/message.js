
// caminho: src/whatsapp/messages.js


async function sendMessage(
    sock,
    target,
    message
) {

    if (!sock) {

        throw new Error(
            'Socket do WhatsApp não disponível.'
        )

    }


    if (!target) {

        throw new Error(
            'Grupo não informado.'
        )

    }


    if (
        typeof message !== 'string' ||
        !message.trim()
    ) {

        throw new Error(
            'Mensagem não informada.'
        )

    }


    await sock.sendMessage(
        target,
        {
            text:
                message.trim()
        }
    )


    return {

        success:
            true,

        target

    }

}


/*
 * Aguarda o tempo definido
 * antes de continuar para
 * o próximo grupo.
 *
 * Também verifica se o
 * envio foi cancelado.
 */

function wait(
    milliseconds,
    shouldCancel
) {

    return new Promise(
        resolve => {

            const start =
                Date.now()


            const interval =
                setInterval(
                    () => {

                        if (
                            shouldCancel()
                        ) {

                            clearInterval(
                                interval
                            )

                            resolve()

                        }

                    },
                    100
                )


            setTimeout(
                () => {

                    clearInterval(
                        interval
                    )

                    resolve()

                },
                milliseconds
            )

        }
    )

}


/*
 * Envia a mensagem para
 * os grupos selecionados.
 *
 * delay = 5 segundos
 * por padrão.
 */

async function sendToGroups(
    sock,
    groups,
    message,
    shouldCancel,
    onProgress,
    delay = 10
) {

    if (
        !Array.isArray(
            groups
        )
    ) {

        throw new Error(
            'Lista de grupos inválida.'
        )

    }


    /*
     * Garante que o delay
     * seja um número válido.
     */

    const delaySeconds =
        Number(delay)


    const validDelay =
        Number.isFinite(
            delaySeconds
        ) &&
        delaySeconds >= 0
            ? delaySeconds
            : 5


    const delayMilliseconds =
        validDelay * 1000


    console.log(
        '[WHATSAPP] Delay entre grupos:',
        `${validDelay} segundos`
    )


    let sent = 0

    let failed = 0


    for (
        let index = 0;
        index < groups.length;
        index++
    ) {

        /*
         * Verifica cancelamento
         * antes de enviar.
         */

        if (
            shouldCancel()
        ) {

            console.log(
                '[WHATSAPP] Envio cancelado.'
            )


            return {

                cancelled:
                    true,

                sent:
                    sent,

                failed:
                    failed

            }

        }


        const group =
            groups[index]


        console.log(
            '[WHATSAPP] Enviando para:',
            group.name
        )


        try {

            await sendMessage(
                sock,
                group.id,
                message
            )


            sent++


            console.log(
                '[WHATSAPP] Mensagem enviada para:',
                group.name
            )

        } catch (
            error
        ) {

            failed++


            console.error(
                `[WHATSAPP] Erro ao enviar para ${group.name}:`,
                error
            )

        }


        /*
         * Informa o progresso
         * depois de cada tentativa.
         */

        if (
            onProgress
        ) {

            onProgress({

                current:
                    index + 1,

                total:
                    groups.length,

                sent:
                    sent,

                failed:
                    failed,

                group:
                    group.name

            })

        }


        /*
         * Só espera entre grupos.
         *
         * NÃO espera depois
         * do último grupo.
         */

        if (
            index <
                groups.length - 1 &&
            delayMilliseconds > 0
        ) {

            console.log(
                '[WHATSAPP] Aguardando:',
                `${validDelay} segundos`
            )


            await wait(
                delayMilliseconds,
                shouldCancel
            )


            /*
             * Verifica novamente
             * depois do delay.
             */

            if (
                shouldCancel()
            ) {

                console.log(
                    '[WHATSAPP] Envio cancelado durante o delay.'
                )


                return {

                    cancelled:
                        true,

                    sent:
                        sent,

                    failed:
                        failed

                }

            }

        }

    }


    console.log(
        '[WHATSAPP] Envio finalizado.'
    )


    return {

        cancelled:
            false,

        sent:
            sent,

        failed:
            failed

    }

}


module.exports = {

    sendMessage,

    sendToGroups

}
