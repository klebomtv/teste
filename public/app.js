// caminho: public/app.js

import {
    socket
} from './js/socket.js'

import {
    setupConnection
} from './js/connection.js'

import {
    setupGroups
} from './js/groups.js'

import {
    setupMessages
} from './js/messages.js'


setupConnection(
    socket
)

setupGroups(
    socket
)

setupMessages(
    socket
)


socket.connect()