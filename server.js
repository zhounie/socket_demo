const http = require('http')
const fs = require('fs')
const path = require('path')
const mime = require('mime')
const cache = {} // 缓存文件内容
const chatServer = require('./lib/chat_server')

const send404 = (res) => {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.write('Error 404: resource not found.')
    res.end()
}

const sendFile = (res, filePath, fileContents) => {
    res.writeHead(200,
        {'Content-Type': mime.getType(path.basename(filePath))}
    )
    res.end(fileContents)
}


const serverStatic = (res, cache, absPath) => {
    if (cache[absPath]) { // 检查文件是否缓存在内存中
        sendFile(res, absPath, cache[absPath]) // 从内存中返回文件
    } else {
        console.log(absPath);
        
        fs.exists(absPath, (exists) => { // 检查文件是否存在
            if (exists) {
                fs.readFile(absPath, (err, data) => { // 从硬盘中读取文件
                    if (err) {
                        send404(res)
                    } else {
                        cache[absPath] = data
                        sendFile(res, absPath, data)  // 从硬盘中读取文件并返回
                    }
                })
            } else {
                send404(res)
            }
        })
    }
}


const server = http.createServer((req, res) => {
    let filePath = false
    if (req.url == '/') {
        filePath = 'public/index.html'
    } else {
        filePath = 'public' + req.url
    }   
    let absPath = './' + filePath
    serverStatic(res, cache, absPath)
}).listen(3000, () => {
    console.log('localhost:3000');  
})

chatServer.listen(server)