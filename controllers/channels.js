require('dotenv').load()
var Joi = require('joi')
var collections = ['members', 'groups', 'events', 'channel']
var mongojs = require('mongojs')
var db = mongojs.connect(process.env.MONGODB_URL, collections)
var Promise = require('es6-promise').Promise
var Kaiseki = require('kaiseki')
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY)
var lodash = require('lodash')

function getUsers(user_id, cb) {
  var params = {
    where: {
      '$relatedTo': {
        'object': {
          '__type': 'Pointer',
          'objectId': user_id,
          'className': '_User'
        },
        'key': 'following'
      },
      // objectId: 'He8hQies9q'
    }
  }

  kaiseki.getUsers(params, function (err, res, body, success) {
    cb(body)
  })
}

module.exports = {
  event: {
    handler: function (request, reply) {
      'use strict'
      var payload = request.payload

      if (!payload.key || payload.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }

      var activity = {}
      activity.activity_id = payload.activity_id
      activity.activity_type = payload.activity_type
      activity.activity_message = payload.activity_message
      activity.user_id = payload.user_id.split(',')
      activity.picture_id = payload.picture_id
      activity.date_created = payload.date_created

      if (payload.target_user_id) {
        activity.target_user_id = payload.target_user_id
      }

      db.channel.save(activity, function (err, result) {
        if (result) {
          reply({
            status: 1,
            message: 'message pushed'
          })
        }

      })

    },

    description: 'Post a groupfeed activity',
    notes: 'Post a groupfeed activity',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        activity_id: Joi.string().required().description('id of activity'),
        activity_type: Joi.string().required().description('type of activity, e.g group, event, follow, etc.'),
        activity_message: Joi.string().required().description('activity message'),
        user_id: Joi.string().required().description('user id of person(s) that triggered the activity, if more than one, separate by comma'),
        target_user_id: Joi.string().description('user id of person'),
        picture_id: Joi.string().description('picture id of the user'),
        date_created: Joi.string().required().description('date activity was created in ISO string format(2015-10-26T14:46:34.899Z)')
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

      var activity = {}
      if (payload.activity_id) {
        activity.activity_id = payload.activity_id
      }
      activity.activity_type = payload.activity_type
      activity.user_id = payload.user_id

      if (payload.target_user_id) {
        activity.target_user_id = payload.target_user_id
      }

      db.channel.remove(activity, function (err, result) {
        if (result) {
          reply({
            status: 1,
            message: 'message deleted'
          })
        }

      })

    },

    description: 'Delete a groupfeed activity',
    notes: 'Delete a groupfeed activity',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        activity_id: Joi.string().description('id of activity'),
        activity_type: Joi.string().required().description('type of activity, e.g group, event, follow, etc.'),
        user_id: Joi.string().required().description('user id of person that triggered the activity'),
        target_user_id: Joi.string().description('user id of person'),
      }
    }

  },

  index: {
    handler: function (request, reply) {
      'use strict'
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }
      var skip = request.query.offset || 0
      var limit = request.query.limit || 20
      var queryObj = {},
        activityArr, activityStr, caseOne = ['event', 'group', 'event_joined', 'group_joined', 'comment'],
        caseTwo = ['follow', 'group_invite', 'event_invite', 'reply']

      if (request.query.activity_type) {
        activityStr = request.query.activity_type
        activityArr = activityStr.split(',')

        queryObj.activity_type = {
          $in: activityArr
        }
      }

      getUsers(request.query.user_id, function (users) {
        var user_ids = lodash.pluck(users, 'objectId')

        if (lodash.isEqual(activityArr.sort(), caseOne.sort())) {
          queryObj.user_id = {
            $in: user_ids
          }
        }

        if (lodash.isEqual(activityArr.sort(), caseTwo.sort())) {
          console.log('two')
          queryObj.user_id = request.query.user_id
        }
        console.log(queryObj)

        if (request.query.last_sync) {
          queryObj.last_sync = {
            $gte: new Date(decodeURIComponent(request.query.last_sync))
          }
        }

        db.channel.count(queryObj, function (err, res) {
          db.channel.find(queryObj).sort({
            date_created: -1
          }).skip(skip).limit(limit, function (err, results) {
            reply({
              activities: results,
              total_amount: res
            })
          })

        })

      })

    },

    description: 'Get Groupfeed activities',
    notes: 'Returns Groupfeed activities',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().integer().description('defaults to 0'),
        user_id: Joi.string().required().description('id of user'),
        activity_type: Joi.string().required().description('list of activities, separated by comma'),
        last_sync: Joi.string().description('last sync')
      }
    }

  }

}