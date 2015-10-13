require('dotenv').load();
var collections = ['members', 'groups', 'events'];
var mongojs = require("mongojs");
var db = mongojs.connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var Promise = require('es6-promise').Promise;


module.exports = {

  events: {
    handler: function (request, reply) {

      "use strict";
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }


      var skip = request.query.offset || 0;
      var limit = request.query.limit || 20;
      var filterIds;

      new Promise(function (resolve) {

        db.members.find({
          user_id: request.query.user_id,
          type: 'event'
        }, {
          type_id: 1
        }).skip(skip).limit(limit, function (err, results) {
          resolve(results);
        });

      }).then(function (res) {
        return new Promise(function (resolve) {
          filterIds = _.pluck(res, "type_id");
          db.events.find({
            event_id: {
              $in: filterIds
            }
          }).skip(skip).limit(limit, function (err, results) {
            resolve(results);
          });

        });
      }).then(function (res) {
        reply(res);
      });


    },
    description: 'Get events a user has joined',
    notes: 'Returns events a user has joined',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        user_id: Joi.string().required().description('id of user'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().min(1).integer().description('defaults to 0'),
      }
    }

  },

  groups: {
    handler: function (request, reply) {

      "use strict";
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }


      var skip = request.query.offset || 0;
      var limit = request.query.limit || 20;
      var filterIds;

      new Promise(function (resolve) {

        db.members.find({
          user_id: request.query.user_id,
          type: 'group'
        }, {
          type_id: 1
        }).skip(skip).limit(limit, function (err, results) {
          resolve(results);
        });

      }).then(function (res) {
        return new Promise(function (resolve) {
          filterIds = _.pluck(res, "type_id");
          db.groups.find({
            group_id: {
              $in: filterIds
            }
          }).skip(skip).limit(limit, function (err, results) {
            resolve(results);
          });

        });
      }).then(function (res) {
        reply(res);
      });
    },
    description: 'Get groups a user has joined',
    notes: 'Returns groups a user has joined',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        user_id: Joi.string().required().description('id of user'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().min(1).integer().description('defaults to 0'),
      }
    }

  }

};