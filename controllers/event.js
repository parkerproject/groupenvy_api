require('dotenv').load()
var collections = ['events', 'members']
var mongojs = require('mongojs')
var db = mongojs.connect(process.env.MONGODB_URL, collections)
var Joi = require('joi')
var _ = require('lodash')
var randtoken = require('rand-token')

module.exports = {
  create: {
    handler: function (request, reply) {
      'use strict'
      var _event = request.payload
      if (!_event.key || _event.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }

      if (request.payload.geo) {
        var geo = _event.geo.split(',')
        _event.loc = {
          type: 'Point',
          coordinates: [Number(geo[0]), Number(geo[1])]
        }
      }

      var name = (_event.name) ? _event.name : ''

      db.events.find({
        name: name
      }).limit(1, function (err, docs) {
        if (err) console.log(err)
        if (docs.length !== 0) {
          reply({
            status: 0,
            message: 'An event with that name already exists'
          }).type('application/json ')
        } else {
          _event.event_id = randtoken.generate(10)
          delete _event.key
          db.events.save(_event, function (err, result) {
            if (err) console.log(err)
            if (result) {
              reply({
                status: 1,
                message: 'Your new event has been created',
                event_id: _event.event_id
              }).type('application/json')
            }
          })
        }

      })
    },

    description: 'Create Event',
    notes: 'Create new Event',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        name: Joi.string().required().description('name of event'),
        event_status: Joi.string().required().description('event status should be public or private'),
        picture_id: Joi.string().required().description('image id of event image'),
        creator_id: Joi.string().required().description('id of event creator'),
        creator_picture: Joi.string().description('picture of creator'),
        creator_name: Joi.string().required().description('name of event creator'),
        date_created: Joi.string().description('date that event was created'),
        location: Joi.string().required().description('event location'),
        geo: Joi.string().required().description('geo location of event, format should be geo=longitude,latitude'),
        event_date: Joi.string().required().description('event date'),
        end_date: Joi.string().description('event end date'),
        description: Joi.string().description('event description')
      }
    }

  },

  get: {
    handler: function (request, reply) {
      'use strict'
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }

      var eventObject = {}

      if (request.query.event_id) {
        eventObject.event_id = request.query.event_id
      }

      db.events.find(eventObject).limit(1, function (err, results) {
        reply(results)
      })
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

  put: {
    handler: function (request, reply) {
      'use strict'
      var payload = request.payload
      var eventObj = {}
      if (!payload.key || payload.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }

      if (payload.geo) {
        var geo = payload.geo.split(',')
        eventObj.loc = {
          type: 'Point',
          coordinates: [Number(geo[0]), Number(geo[1])]
        }
      }

      if (payload.name) {
        eventObj.name = payload.name
      }

      if (payload.creator_name) {
        eventObj.creator_name = payload.creator_name
      }

      if (payload.description) {
        eventObj.description = payload.description
      }

      if (payload.picture_id) {
        eventObj.picture_id = payload.picture_id
      }

      if (payload.location) {
        eventObj.location = payload.location
      }

      if (payload.event_date) {
        eventObj.event_date = payload.event_date
      }

      if (payload.end_date) {
        eventObj.end_date = payload.end_date
      }

      if (payload.event_status) {
        eventObj.event_status = payload.event_status
      }

      db.events.findAndModify({
        query: {
          creator_id: payload.creator_id,
          event_id: payload.event_id
        },
        update: {
          $set: eventObj
        },
        new: true
      }, function (err, doc, lastErrorObject) {
        reply({
          status: 1,
          message: 'Your event has been updated',
          event_id: payload.event_id
        }).type('application/json')
      })

    },

    description: 'Update Event',
    notes: 'Update an Event',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        name: Joi.string().description('name of event'),
        event_status: Joi.string().description('event status should be public or private'),
        picture_id: Joi.string().description('image id of event image'),
        creator_id: Joi.string().required().description('id of event creator'),
        creator_name: Joi.string().description('name of event creator'),
        location: Joi.string().description('event location'),
        geo: Joi.string().description('geo location of event, format should be geo=longitude,latitude'),
        event_date: Joi.string().description('event date'),
        end_date: Joi.string().description('event end date'),
        description: Joi.string().description('event description'),
        event_id: Joi.string().required().description('id of event')
      }
    }

  },

  delete: {
    handler: function (request, reply) {
      'use strict'
      var payload = request.payload
      if (!payload.key || payload.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }

      var eventObj = {
        event_id: payload.event_id,
        creator_id: payload.creator_id
      }

      db.events.remove(eventObj, function () {
        db.members.remove({
          type_id: payload.event_id,
        }, function () {
          reply({
            status: 1,
            message: 'Your event has been deleted',
            event_id: payload.event_id
          }).type('application/json')
        })
      })

    },

    description: 'Delete Event',
    notes: 'Delete an Event',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        creator_id: Joi.string().required().description('id of event creator'),
        event_id: Joi.string().required().description('id of event')
      }
    }

  }

}