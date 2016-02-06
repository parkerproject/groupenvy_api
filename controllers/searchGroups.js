require('dotenv').load()
var collections = ['groups']
var db = require('mongojs').connect(process.env.MONGODB_URL, collections)
var Joi = require('joi')
var _ = require('lodash')
var server = require('../server')
var dist = require('../helpers/dist')
var Promise = require('es6-promise').Promise

module.exports = {
  index: {
    handler: function (request, reply) {
      'use strict'

      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }

      var q = decodeURIComponent(request.query.q)
      var limit = request.query.limit || 20
      var skip = request.query.offset || 0
      var queryObj = {}
      q = q.trim()

      queryObj.$text = {
        $search: q
      }

      new Promise(function (resolve) {
        console.log(queryObj)
        db.groups.find(queryObj, {
          score: {
            $meta: 'textScore'
          }
        }).skip(skip).sort({
          score: {
            $meta: 'textScore'
          }
        }).limit(limit, function (err, results) {
          var res = Array.isArray(results) ? results : []
          resolve(res)
        })
      }).then(function (res) {
        reply({
          results: res
        })
      })
    },

    description: 'Search Groups',
    notes: 'search groups using any keywords',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        q: Joi.string().required().description('query term, e.g group name or keywords'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().integer().description('defaults to 0')
      }
    }

  }

}