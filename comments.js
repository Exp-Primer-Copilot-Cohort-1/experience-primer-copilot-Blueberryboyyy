// Create web server
// 1. Load the http module
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var comments = require('./comments');
var mime = require('mime');

// 2. Create an http server
http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), uri);

    // 3. Read the file and send it to the client
    fs.exists(filename, function(exists) {
        if(!exists) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('404 Not Found\n');
            res.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
        }

        fs.readFile(filename, 'binary', function(err, file) {
            if(err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.write(err + '\n');
                res.end();
                return;
            }

            var type = mime.lookup(filename);
            res.writeHead(200, {'Content-Type': type});
            res.write(file, 'binary');
            res.end();
        });
    });
}).listen(8124);

// 4. Create a socket.io server
var io = require('socket.io').listen(8125);
io.sockets.on('connection', function(socket) {
    // 5. Listen for new comments and broadcast them
    socket.on('new comment', function(data) {
        comments.addComment(data);
        socket.broadcast.emit('new comment', data);
    });

    // 6. Send comments to clients
    socket.on('get comments', function() {
        socket.emit('get comments', comments.getComments());
    });
});
console.log('Server running at http://localhost:8124/');

// 7. Load the comments module
// 8. Create a comment array
// 9. Add a comment to the array
// 10. Get all comments
// 11. Export the addComment and getComments functions