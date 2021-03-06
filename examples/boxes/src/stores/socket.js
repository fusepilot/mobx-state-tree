import {onSnapshot, applySnapshot, onPatch, applyPatch, onAction, applyAction} from 'mobx-state-tree';

let subscription;
export default function syncStoreWithBackend(socket, store) {

    subscription = onAction(store, (data, next) => {
        socketSend(data)
        return next()
    })

    onSocketMessage((data) => {
        applyAction(store, data)
    })

    let isHandlingMessage = false
    function socketSend(data) {
        if (!isHandlingMessage)
            socket.send(JSON.stringify(data))
    }

    function onSocketMessage(handler) {
        socket.onmessage = event => {
            isHandlingMessage = true
            handler(JSON.parse(event.data))
            isHandlingMessage = false
        }
    }
}

/**
 * Clean up old subscription when switching communication system
 */
if (module.hot) {
    module.hot.dispose((data) => {
        subscription()
    });
}