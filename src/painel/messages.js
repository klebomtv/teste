// caminho: src/painel/messages.js

const cooldown =
    require('./cooldown')


function createMessageSystem(
    whatsapp,
    io
) {

    let sending =
        false


    async function sendMessage(
        message,
        groupIds
    ) {

        /*
         * Impede uma nova execução
         * enquanto outra ainda está ativa.
         */

        if (
            sending
        ) {

            return {
                success: false,
                message:
                    'Já existe um envio em andamento.'
            }

        }


        /*
         * Verifica se o WhatsApp
         * está conectado.
         */

        const whatsappState =
            whatsapp.getState()


        if (
            !whatsappState.connected
        ) {

            return {
                success: false,
                message:
                    'WhatsApp não está conectado.'
            }

        }


        /*
         * Valida a mensagem.
         */

        if (
            typeof message !== 'string' ||
            !message.trim()
        ) {

            return {
                success: false,
                message:
                    'A mensagem não pode estar vazia.'
            }

        }


        /*
         * Valida os grupos.
         */

        if (
            !Array.isArray(groupIds) ||
            groupIds.length === 0
        ) {

            return {
                success: false,
                message:
                    'Nenhum grupo foi selecionado.'
            }

        }


        /*
         * Remove grupos duplicados.
         */

        const groups =
            [
                ...new Set(
                    groupIds
                )
            ]


        /*
         * Inicia a execução.
         */

        sending =
            true


        try {

            const sock =
                whatsappState.socket ||
                whatsapp.getSocket?.()


            if (
                !sock
            ) {

                return {
                    success: false,
                    message:
                        'Conexão do WhatsApp não encontrada.'
                }

            }


            for (
                let index = 0;
                index < groups.length;
                index++
            ) {

                const groupId =
                    groups[index]


                /*
                 * Informa ao painel
                 * qual grupo será processado.
                 */

                io.emit(
                    'send-progress',
                    {
                        current:
                            index + 1,

                        total:
                            groups.length,

                        groupId
                    }
                )


                console.log(
                    `[PAINEL] Enviando mensagem para o grupo ${index + 1}/${groups.length}: ${groupId}`
                )


                await sock.sendMessage(
                    groupId,
                    {
                        text:
                            message.trim()
                    }
                )


                console.log(
                    `[PAINEL] Mensagem enviada para: ${groupId}`
                )


                /*
                 * Aguarda 30 segundos
                 * antes do próximo grupo.
                 *
                 * Não precisa esperar depois
                 * do último grupo.
                 */

                if (
                    index <
                    groups.length - 1
                ) {

                    await cooldown.wait(
                        30
                    )

                }

            }


            io.emit(
                'send-finished',
                {
                    success: true,

                    message:
                        `Mensagem enviada para ${groups.length} grupo(s).`
                }
            )


            return {
                success: true,

                message:
                    `Mensagem enviada para ${groups.length} grupo(s).`
            }

        } catch (error) {

            console.error(
                '[PAINEL] Erro durante o envio:',
                error
            )


            io.emit(
                'send-finished',
                {
                    success: false,

                    message:
                        'Ocorreu um erro durante o envio.'
                }
            )


            return {
                success: false,

                message:
                    'Ocorreu um erro durante o envio.'
            }

        } finally {

            /*
             * Libera o sistema somente
             * quando toda a execução terminou.
             */

            sending =
                false

        }

    }


    function isSending() {

        return sending

    }


    return {
        sendMessage,
        isSending
    }

}


module.exports =
    createMessageSystem