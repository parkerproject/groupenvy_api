require('dotenv').load()
var collections = ['events']
var db = require('mongojs').connect(process.env.MONGODB_URL, collections)
var Joi = require('joi')
var _ = require('lodash')
var server = require('../server')
var dist = require('../helpers/dist')

function _prepareQueryObject(radius, location) {
  if (location) {
    var lng = location.split(',')[0]
    var lat = location.split(',')[1]

    return {
      $geoWithin: {
        $centerSphere: [
          [Number(lng), Number(lat)], radius
        ]
      }

    }
  } else {
    return {}
  }
}

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
      var _geo = request.query.geo
      var accuracy = 1 // accuracy for computing geo distance
      var queryObj = {}
      q = q.trim()

      queryObj.$text = {
        $search: q
      }

      new Promise(function (resolve) {
        // var _radius = 50 / 3959 // radius in 5 miles
        // if (request.query.geo) {
        //   queryObj.loc = _prepareQueryObject(_radius, request.query.geo)
        // }
        resolve()
      }).then(function () {
        return new Promise(function (resolve) {
          db.events.find(queryObj, {
            score: {
              $meta: 'textScore'
            }
          }).skip(skip).sort({
            score: {
              $meta: 'textScore'
            }
          }).limit(limit, function (err, results) {
            var res = Array.isArray(results) ? results : []

            if (_geo && parseFloat(_geo[0]) && parseFloat(_geo[1])) {
              res = res.sort(function (d1, d2) {
                return dist(d1.loc.coordinates, _geo, accuracy) - dist(d2.loc.coordinates, _geo, accuracy)
              })
            }
            resolve(res)
          })
        })
      }).then(function (res) {
        reply({
          results: res
        })
      })
    },
    description: 'Search events',
    notes: 'search events using any keywords',
    tags: ['api'],
    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        q: Joi.string().required().description('query term, e.g event name or keywords'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().integer().description('defaults to 0'),
        geo: Joi.string().description('the geo position in format should be geo=longitude,latitude')
      }
    }

  }

}