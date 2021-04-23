let fs = require("fs");
let path =require("path");
let enableDestroy = require('server-destroy');

let startApp = function(app, callback=null){
    let debug = require('debug')('testpassport:server');
    let https = require('https');
    let http = require('http');
  
    /**
     * Get port from environment and store in Express.
     */
  
    let port = normalizePort(process.env.PORT || '5000');
    app.set('port', port);
  
    /**
     * Create HTTP server.
     */
    let config = {}
  
    let server = http.createServer(app);
    let httpsServer = https.createServer(config, app);
    httpsServer.listen(3000);
    httpsServer.on('error', onError);
    httpsServer.on('listening', onListening);
  
    /**
     * Listen on provided port, on all network interfaces.
     */
  
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    if(callback){
        enableDestroy(server);
        callback(app, server);
    }
  
    /**
     * Normalize a port into a number, string, or false.
     */
  
    function normalizePort(val) {
        let port = parseInt(val, 10);
  
        if (isNaN(port)) {
            // named pipe
            return val;
        }
  
        if (port >= 0) {
            // port number
            return port;
        }
  
        return false;
    }
  
    /**
     * Event listener for HTTP server "error" event.
     */
  
    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
  
        let bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;
  
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
  
    /**
     * Event listener for HTTP server "listening" event.
     */
  
    function onListening() {
        let addr = server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        console.log('Listening on ' + bind);
    }
  };

  require('dotenv').config();

require('../server').then(startApp)