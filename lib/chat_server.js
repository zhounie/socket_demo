const socketio = require('socket.io')

let io;
let guestNumber = 1
let nickNames = {}
let namesUsed = []
let currentRoom = {}
const assignGuestName = (socket, guestNumber, nickNames, namesUsed) => {
    let name = 'Guest' + guestNumber
    nickNames[socket.id] = name
    socket.emit('nameResult', {
        success: true,
        name: name
    })
    namesUsed.push(name)
    return guestNumber + 1
}
const joinRoom = (socket, room) => {
    socket.join(room)
    currentRoom[socket.id] = room
    socket.emit('join')
}

exports.listen = (server) => {
    io = socketio.listen(server) // 启动socketIO服务器，允许它搭载在已有的http服务商
    io.set('log level', 1)
    io.sockets.on('connection', (socket) => {
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed) // 用户连接上来时赋予其一个访客名

        joinRoom(socket, 'Lobby') // 在用户链接上来时把他放入聊天室lobby
        // 处理用户消息更名聊天室创建变更
        handleMessageBroadcastring(socket, nickNames)
        handleNameChangeAttempts(socket, nickNames, namesUsed)
        handleRoomJoining(socket)
    
        socket.on('rooms', () => { // 向其提供已经被占用的聊天室列表
            socket.emit('rooms', io.sockets.manager.rooms)
        })
        handleClientDisconnection(socket, nickNames, namesUsed)
    })


}