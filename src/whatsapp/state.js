// caminho: src/whatsapp/state.js

let sock = null

let started = false

let connected = false

let currentStatus =
    'WhatsApp está parado.'

let currentQR = false

let groups = []


function getSocket() {

    return sock
}


function setSocket(
    newSocket
) {

    sock =
        newSocket
}


function isStarted() {

    return started
}


function setStarted(
    value
) {

    started =
        value
}


function isConnected() {

    return connected
}


function setConnected(
    value
) {

    connected =
        value
}


function getStatus() {

    return currentStatus
}


function setStatus(
    status
) {

    currentStatus =
        status
}


function hasQR() {

    return currentQR
}


function setQR(
    value
) {

    currentQR =
        value
}


function getGroups() {

    return groups
}


function setGroups(
    newGroups
) {

    groups =
        newGroups
}


function reset() {

    sock =
        null

    started =
        false

    connected =
        false

    currentStatus =
        'WhatsApp está parado.'

    currentQR =
        false

    groups =
        []
}


function getState() {

    return {

        started,

        connected,

        status:
            currentStatus,

        qr:
            currentQR,

        groups
    }
}


module.exports = {

    getSocket,
    setSocket,

    isStarted,
    setStarted,

    isConnected,
    setConnected,

    getStatus,
    setStatus,

    hasQR,
    setQR,

    getGroups,
    setGroups,

    reset,

    getState
}