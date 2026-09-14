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
            text: message.trim()
        }
    )

    return {
        success: true,
        target
    }
}

async function sendToGroups(
    sock,
    groups,
    message,
    shouldCancel,
    onProgress
) {
    if (!Array.isArray(groups)) {
        throw new Error(
            'Lista de grupos inválida.'
        )
    }

    let sent = 0
    let failed = 0

    for (
        let index = 0;
        index < groups.length;
        index++
    ) {
        if (shouldCancel()) {
            return {
                cancelled: true,
                sent,
                failed
            }
        }

        const group =
            groups[index]

        try {
            await sendMessage(
                sock,
                group.id,
                message
            )

            sent++

        } catch (error) {
            failed++

            console.error(
                `[WHATSAPP] Erro ao enviar para ${group.name}:`,
                error
            )
        }

        if (onProgress) {
            onProgress({
                current: index + 1,
                total: groups.length,
                sent,
                failed,
                group: group.name
            })
        }
    }

    return {
        cancelled: false,
        sent,
        failed
    }
}

module.exports = {
    sendMessage,
    sendToGroups
}