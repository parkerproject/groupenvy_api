require('dotenv').load();
var collections = ['members'];
var mongojs = require("mongojs");
var db = mongojs.connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var randtoken = require('rand-token');


module.exports = {

  index: {
    handler: function (request, reply) {

      "use strict";
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }


      var skip = request.query.offset || 0;
      var limit = request.query.limit || 20;

      db.members.find({
        type_id: request.query.type_id
      }).skip(skip).limit(limit, function (err, results) {
        reply(results);
      });
    },
    description: 'Get members of a group or event',
    notes: 'Returns members of a group or event',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        type_id: Joi.string().required().description('id of group or event'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().min(1).integer().description('defaults to 0'),
      }
    }

  },

  add: {
    handler: function (request, reply) {

      "use strict";
      if (!request.payload.key || request.payload.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      var user = {
        user_id: request.payload.user_id,
        picture_id: request.payload.picture_id,
        name: request.payload.name,
        type: request.payload.type,
        type_id: request.payload.type_id
      };

      db.members.find({
        user_id: request.payload.user_id,
        type_id: request.payload.type_id
      }).limit(1, function (err, result) {

        if (result.length === 0) {
          db.members.save(user, function () {
            reply('User added');
          });
        } else {
          reply('Already a member');
        }

      });
    },
    description: 'Add member to group or event',
    notes: 'This will add a member to a group or an event',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        type_id: Joi.string().required().description('id of group or event'),
        type: Joi.string().required().description('type should be either "group" or "event"'),
        user_id: Joi.string().required().description('id of the user'),
        picture_id: Joi.string().required().description('picture id of the user'),
        name: Joi.string().required().description('name of the user')
      }
    }

  },

  update: {
    handler: function (request, reply) {

      "use strict";
      if (!request.payload.key || request.payload.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      var user = {};

      if (query.payload.picture_id) {
        user.picture_id = query.payload.picture_id;
      }

      if (query.payload.name) {
        user.name = query.payload.name;
      }


      db.members.update({
        user_id: request.payload.user_id
      }, {
        $set: user
      }, {
        multi: true
      }, function () {
        reply('User has been updated');
      });
    },
    description: 'Update a member in all groups and events',
    notes: 'This will update a member\'s info in all groups and events',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        user_id: Joi.string().required().description('id of the user'),
        picture_id: Joi.string().description('picture id of the user'),
        name: Joi.string().description('name of the user')
      }
    }

  },

  remove: {
    handler: function (request, reply) {

      "use strict";
      if (!request.payload.key || request.payload.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      var user = {
        user_id: request.payload.user_id,
        type_id: request.payload.type_id
      };

      db.members.remove(user, function () {
        reply('User removed');
      });


    },
    description: 'Remove member from group or event',
    notes: 'This will remove a member from a group or an event',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        type_id: Joi.string().required().description('id of group or event'),
        user_id: Joi.string().required().description('id of the user')
      }
    }

  }


};