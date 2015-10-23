require('dotenv').load();
var Joi = require('joi');
var collections = ['members', 'groups', 'events', 'channel'];
var mongojs = require("mongojs");
var db = mongojs.connect(process.env.MONGODB_URL, collections);
var Promise = require('es6-promise').Promise;

module.exports = {
  event: {
    handler: function (request, reply) {
      "use strict";
      var payload = request.payload;

      if (!payload.key || payload.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      db.channel.save({
        activity_name: payload.activity_name,
        activity_message: payload.activity_message,
        user_id: payload.user_id,
        picture_id: payload.picture_id
      }, function (err, result) {
        if (result) {
          reply({
            status: 1,
            message: 'message pushed'
          });
        }

      });

    },

    description: 'Post a groupfeed activity',
    notes: 'Post a groupfeed activity',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        activity_name: Joi.string().required().description('name of activity'),
        activity_message: Joi.string().required().description('activity message'),
        user_id: Joi.string().required().description('user id of person that triggered the activity'),
        picture_id: Joi.string().required().description('picture id of the user')
      }
    }

  },

  index: {
    handler: function (request, reply) {

      "use strict";
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }
      var skip = request.query.offset || 0;
      var limit = request.query.limit || 20;

      db.channel.find({}).skip(skip).limit(limit, function (err, results) {
        reply(results);
      });


    },

    description: 'Get groupfeed activities',
    notes: 'Returns groupfeed activities',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().integer().description('defaults to 0'),
      }
    }

  }


};