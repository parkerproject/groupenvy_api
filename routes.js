var requireDirectory = require('require-directory');

module.exports = function (server) {

  var controller = requireDirectory(module, './controllers');

  // Array of routes for Hapi
  var routeTable = [{
    method: 'POST',
    path: '/api/group/create',
    config: controller.group.create
  }];
  return routeTable;
};