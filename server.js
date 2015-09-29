var Hapi = require('hapi');
var Inert = require('inert');
var Vision = require('vision');
var HapiSwagger = require('hapi-swagger');
var swaggerOptions = {
  apiVersion: '1.0.0'
};
var server = new Hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: 1335
});

var routes = require('./routes')(server);

// Export the server to be required elsewhere.
module.exports = server;

//Start the server
server.register([
    Inert,
    Vision,
  {
    register: HapiSwagger,
    options: swaggerOptions
    }], function (err) {
  server.views({
    path: './views',
    engines: {
      html: require('swig')
    }
  });
  server.route(routes);
  server.start(function () {
    //Log to the console the host and port info
    console.log('Server started at: ' + server.info.uri);
  });
});