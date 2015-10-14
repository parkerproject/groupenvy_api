require('dotenv').load();
var collections = ['events'];
var db = require("mongojs").connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var server = require('../server');


module.exports = {
  index: {
    handler: function (request, reply) {

      "use strict";
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      var eventsObj = {};

      var skip = request.query.offset || 0;
      var limit = request.query.limit || 20;

      if (request.query.creator_id) {
        eventsObj.creator_id = request.query.creator_id;
      }

      eventsObj.event_status = request.query.event_status || 'public';

      db.events.find(eventsObj).skip(skip).limit(limit, function (err, results) {
        reply(results);
      });
    },

    description: 'Get Events',
    notes: 'Returns list of events',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().integer().description('defaults to 0'),
        creator_id: Joi.string().description('id of the creator, to filter events created user'),
        event_status: Joi.string().description('event status should be public or private (defaults to public)')
      }
    },

  }


};