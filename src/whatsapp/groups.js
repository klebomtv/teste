// caminho: src/whatsapp/groups.js

async function loadGroups(sock) {

    if (!sock) {
        throw new Error(
            'Socket do WhatsApp não disponível.'
        )
    }

    console.log(
        '[GROUPS] Buscando grupos no WhatsApp...'
    )

    const participating =
        await sock.groupFetchAllParticipating()

    console.log(
        '[GROUPS] JSON recebido do WhatsApp:'
    )

    console.dir(
        participating,
        {
            depth: null,
            colors: false
        }
    )


    const groups =
        Object.values(
            participating || {}
        )
        .map(
            group => ({

                id:
                    group.id,

                name:
                    group.subject ||
                    'Grupo sem nome'

            })
        )


    console.log(
        '[GROUPS] Lista simplificada:'
    )

    console.table(
        groups
    )


    return groups
}


module.exports = {
    loadGroups
}