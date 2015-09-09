//npm install -g node-static
//npm link node-static


var nodeStatic = require('node-static'),
    fileServer = new nodeStatic.Server('assets/'),
    port = process.env.PORT || 3000;

require('http').createServer(function (req, res) {
    fileServer.serve(req, res);
   
}).listen(port);
console.log("Static file server running. \nCTRL + C to shutdown");




