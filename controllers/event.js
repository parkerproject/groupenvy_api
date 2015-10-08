require('dotenv').load();
var collections = ['events'];
var mongojs = require("mongojs");
var db = mongojs.connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var randtoken = require('rand-token');


module.exports = {
  create: {
    handler: function (request, reply) {

      "use strict";
      var _event = request.payload;
      if (!_event.key || _event.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }
      if (request.payload.geo) {
        var geo = _event.geo.split(',');
        _event.loc = {
          type: "Point",
          coordinates: [Number(geo[0]), Number(geo[1])]
        };
      }

      var name = (_event.name) ? _event.name : "";


      db.events.find({
        name: name
      }).limit(1, function (err, docs) {

        if (docs.length !== 0) {
          reply({
            status: 0,
            message: 'An event with that name already exists'
          }).type('application/json ');
        } else {
          _event.event_id = randtoken.generate(10);
          db.events.save(_event, function (err, result) {
            if (result) {
              reply({
                status: 1,
                message: 'Your new event has been created'
              }).type('application/json');
            }
          });
        }

      });
    },

    description: 'Create Event',
    notes: 'Create new Event',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        name: Joi.string().required().description('name of event'),
        public: Joi.string().required().description('boolean; true or false'),
        picture_id: Joi.string().required().description('image id of event image'),
        creator_id: Joi.string().required().description('id of event creator'),
        creator_name: Joi.string().required().description('name of event creator'),
        date_created: Joi.string().required().description('date that event was created'),
        location: Joi.string().required().description('event location'),
        geo: Joi.string().required().description('geo location of event, format should be geo=longitude,latitude'),
        event_date: Joi.string().required().description('event date'),
        description: Joi.string().required().description('event description')
      }
    }

  },

  get: {
    handler: function (request, reply) {

      "use strict";
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      var eventObject = {};

      if (request.query.event_id) {
        eventObject.event_id = request.query.event_id;
      }

      db.events.find(eventObject).limit(1, function (err, results) {
        reply(results);
      });
    },
    description: 'Get event',
    notes: 'Returns an event, you can find all info about this event, e.g members',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        event_id: Joi.string().required().description('id of the event')
      }
    }

  },

  member: {
    handler: function (request, reply) {

      "use strict";
      if (!payload.query.key || payload.query.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      db.events.update({
        event_id: request.payload.event_id
      }, {
        $addToSet: {
          members: request.payload.user_id
        }
      }, function () {
        reply('User added');
      });
    },
    description: 'Add member to event',
    notes: 'This will add a member to an event',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        event_id: Joi.string().required().description('id of the event'),
        user_id: Joi.string().required().description('id of the user')
      }
    }

  },

  remove: {
    handler: function (request, reply) {

      "use strict";
      if (!payload.query.key || payload.query.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      db.events.update({
        event_id: request.payload.event_id
      }, {
        $pull: {
          members: request.payload.user_id
        }
      }, function () {
        reply('User removed');
      });
    },
    description: 'Remove member from event',
    notes: 'This will remove a member from an event',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        event_id: Joi.string().required().description('id of the event'),
        user_id: Joi.string().required().description('id of the user')
      }
    }

  }


};