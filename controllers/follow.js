require('dotenv').load()
var Joi = require('joi')
var collections = ['members', 'groups', 'events', 'channel']
var mongojs = require('mongojs')
var db = mongojs.connect(process.env.MONGODB_URL, collections)
var Promise = require('es6-promise').Promise
var Kaiseki = require('kaiseki')
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY)
var lodash = require('lodash')

function getFollow(follow_id, cb) {
  var params = {
    where: {
      'fromId': follow_id
    }
  }

  kaiseki.getUsers(params, function (err, res, body, success) {
    cb(body)
  })
}

module.exports = {
  index: {
    handler: function (request, reply) {
      'use strict'
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }
      var skip = request.query.offset || 0
      var limit = request.query.limit || 20

      getFollow(request.query.follow_id, function (users) {
        reply(users)
      })

    },

    description: 'Get follow',
    notes: 'Returns follow',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().integer().description('defaults to 0'),
        follow_id: Joi.string().description('follow id'),
      }
    }

  }
}