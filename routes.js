var requireDirectory = require('require-directory');

module.exports = function (server) {

  var controller = requireDirectory(module, './controllers');

  // Array of routes for Hapi
  var routeTable = [{
    method: 'GET',
    path: '/images/{path*}',
    config: controller.assets.images
    }, {
    method: 'GET',
    path: '/css/{path*}',
    config: controller.assets.css
    }, {
    method: 'GET',
    path: '/js/{path*}',
    config: controller.assets.js
   }, {
    method: 'GET',
    path: '/video/{path*}',
    config: controller.assets.video
   }, {
    method: 'POST',
    path: '/email/send',
    config: controller.email.send
  }, {
    method: 'POST',
    path: '/api/group/create',
    config: controller.group.create
  }, {
    method: 'GET',
    path: '/api/members',
    config: controller.members.index
  }, {
    method: 'POST',
    path: '/api/members/add',
    config: controller.members.add
  }, {
    method: 'POST',
    path: '/api/members/remove',
    config: controller.members.remove
  }, {
    method: 'GET',
    path: '/',
    config: controller.base.index
  }, {
    method: 'POST',
    path: '/api/event/create',
    config: controller.event.create
  }, {
    method: 'POST',
    path: '/api/channel/post',
    config: controller.channels.event
  }, {
    method: 'POST',
    path: '/api/comment/create',
    config: controller.comment.create
  }, {
    method: 'GET',
    path: '/api/groups',
    config: controller.groups.index
  }, {
    method: 'GET',
    path: '/api/group',
    config: controller.group.get
  }, {
    method: 'GET',
    path: '/api/events',
    config: controller.events.index
  }, {
    method: 'GET',
    path: '/api/event',
    config: controller.event.get
  }, {
    method: 'GET',
    path: '/api/events/search',
    config: controller.searchEvents.index
  }, {
    method: 'GET',
    path: '/api/groups/search',
    config: controller.searchGroups.index
  }];
  return routeTable;
};