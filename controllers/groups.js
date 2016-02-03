require('dotenv').load()
var collections = ['groups']
var mongojs = require('mongojs')
var db = mongojs.connect(process.env.MONGODB_URL, collections)
var Joi = require('joi')
var _ = require('lodash')
var server = require('../server')

module.exports = {
  index: {
    handler: function (request, reply) {
      'use strict'
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }

      var skip = request.query.offset || 0
      var limit = request.query.limit || 20

      var groupObject = {}

      if (request.query.creator_id) {
        groupObject.creator_id = request.query.creator_id
      }
      // default
      groupObject.group_status = request.query.group_status || 'public'

      db.groups.count(function (error, nbDocs) {
        db.groups.find(groupObject).skip(Math.random() * nbDocs).limit(limit, function (err, results) {
          reply({
            results: results,
            total_amount: nbDocs
          })
        })
      })

    },
    description: 'Get Groups',
    notes: 'Returns list of groups',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().integer().description('defaults to 0'),
        creator_id: Joi.string().description('id of the group creator, to filter groups created by user'),
        group_status: Joi.string().description('group status should be public or private (defaults to public)')
      }
    }

  }

}