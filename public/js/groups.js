// caminho: public/js/groups.js

export function setupGroups(socket) {

    const groupSelect =
        document.getElementById('group')


    socket.on('groups', (groups) => {

        console.log(
            'Grupos recebidos:',
            groups
        )

        groupSelect.innerHTML = ''


        const allOption =
            document.createElement('option')

        allOption.value = 'all'

        allOption.textContent =
            'Todos os grupos'

        groupSelect.appendChild(
            allOption
        )


        groups.forEach((group) => {

            const option =
                document.createElement('option')

            option.value =
                group.id

            option.textContent =
                group.name

            groupSelect.appendChild(
                option
            )
        })
    })
}