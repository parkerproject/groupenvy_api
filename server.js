var Hapi = require('hapi');
var server = new Hapi.Server('0.0.0.0', 1100, {});


// Export the server to be required elsewhere.
module.exports = server;

var routes = require('./routes')(server);
server.route(routes);

//Start the server
server.start(function() {
    //Log to the console the host and port info
    console.log('Server started at: ' + server.info.uri);
});