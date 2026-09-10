// caminho: src/whatsapp/groups.js

async function loadGroups(
    sock
) {

    if (!sock) {

        return []
    }


    try {

        const result =
            await sock.groupFetchAllParticipating()


        const groups =
            Object.values(
                result
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
                        b.name
                    )
            )


        console.log(
            '[WHATSAPP GROUPS] Grupos encontrados:',
            groups.length
        )


        return groups

    } catch (error) {

        console.error(
            '[WHATSAPP GROUPS] Erro ao carregar grupos:',
            error
        )


        return []
    }
}


module.exports = {

    loadGroups
}