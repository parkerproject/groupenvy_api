var requireDirectory = require('require-directory');

module.exports = function (server) {

  var controller = requireDirectory(module, './controllers');

  // Array of routes for Hapi
  var routeTable = [{
    method: 'POST',
    path: '/api/group/create',
    config: controller.group.create
  }, {
    method: 'GET',
    path: '/',
    config: controller.base.index
  }, {
    method: 'POST',
    path: '/api/event/create',
    config: controller.event.create
  }];
  return routeTable;
};