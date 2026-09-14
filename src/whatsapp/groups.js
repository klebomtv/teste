
// caminho: src/whatsapp/groups.js

async function loadGroups(
    sock
) {

    if (!sock) {

        throw new Error(
            'Socket do WhatsApp não disponível.'
        )

    }


    const participating =
        await sock.groupFetchAllParticipating()


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
        .sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    'pt-BR'
                )
        )


    return groups

}


module.exports = {

    loadGroups

}