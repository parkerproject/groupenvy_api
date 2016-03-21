require('dotenv').load()
var collections = ['members', 'channel', 'events', 'groups']
var mongojs = require('mongojs')
var db = mongojs.connect(process.env.MONGODB_URL, collections)
var Joi = require('joi')
var _ = require('lodash')
var Promise = require('es6-promise').Promise

module.exports = {
  index: {
    handler: function (request, reply) {
      'use strict'
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }
      var skip = request.query.offset || 0
      var limit = request.query.limit || 20
      var user = {}
      var count, data

      if (request.query.user_id) {
        user.user_id = request.query.user_id
      }
      user.type_id = request.query.type_id

      new Promise(function (resolve) {
        db.members.count(user, function (err, res) {
          count = res
          resolve(count)
        })
      }).then(function (res) {
        return new Promise(function (resolve) {
          db.members.find(user).sort({
            '_id': -1
          }).skip(skip).limit(limit, function (err, results) {
            data = results
            resolve(data)
          })
        })
      }).then(function (res) {
        reply({
          results: data,
          attenders_amount: count
        })
      })
    },
    description: 'Get members of a group or event',
    notes: 'Returns members of a group or event, checks if a user is in a group or event',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        type_id: Joi.string().required().description('id of group or event, e.g group_id or event_id'),
        user_id: Joi.string().description('id of user'),
        limit: Joi.number().integer().min(1).default(20).description('defaults to 20'),
        offset: Joi.number().integer().description('defaults to 0'),
      }
    }

  },

  add: {
    handler: function (request, reply) {
      'use strict'
      if (!request.payload.key || request.payload.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }

      var user = {
        user_id: request.payload.user_id,
        picture_id: request.payload.picture_id,
        name: request.payload.name,
        type: request.payload.type,
        type_id: request.payload.type_id
      }

      db.members.find({
        user_id: request.payload.user_id,
        type_id: request.payload.type_id
      }).limit(1, function (err, result) {
        if (result.length === 0) {
          db.members.save(user, function () {
            reply({
              status: 1,
              message: 'User has been added'
            })
          })
        } else {
          reply({
            status: 0,
            message: 'Already a member'
          })
        }

      })
    },
    description: 'Add member to group or event',
    notes: 'This will add a member to a group or an event',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        type_id: Joi.string().required().description('id of group or event, e.g group_id or event_id'),
        type: Joi.string().required().description('type should be either "group" or "event"'),
        user_id: Joi.string().required().description('id of the user'),
        picture_id: Joi.string().description('picture id of the user'),
        name: Joi.string().required().description('name of the user')
      }
    }

  },

  update: {
    handler: function (request, reply) {
      'use strict'
      if (!request.payload.key || request.payload.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }

      let user = {}
      let member = {}

      if (request.payload.picture_id) {
        user.creator_picture = request.payload.picture_id
        member.picture_id = request.payload.picture_id
      }

      if (request.payload.name) {
        member.creator_name = request.payload.name
        user.creator_name = request.payload.name
      }

      console.log(user, request.payload.user_id)

      db.members.update({
        user_id: request.payload.user_id
      }, {
        $set: member
      }, {
        multi: true
      }, function () {
        if (request.payload.picture_id) {
          let userEvents = ['event', 'group', 'event_joined', 'group_joined', 'comment']
          let userEvents_2 = ['follow', 'group_invite', 'event_invite', 'reply']

          let queryType = {
            user_id: request.payload.user_id,
            activity_type: {
              $in: userEvents
            }
          }

          let queryType2 = {
            target_user_id: request.payload.user_id,
            activity_type: {
              $in: userEvents_2
            }
          }

          new Promise(function (resolve) {
            db.channel.update({
              $or: [queryType, queryType2]
            }, {
              $set: {
                picture_id: request.payload.picture_id
              }
            }, {
              multi: true
            }, function () {
              resolve()
            })
          }).then(function (res) {
            return new Promise(function (resolve) {
              // update picture in events
              db.events.update({
                creator_id: request.payload.user_id
              }, {
                $set: user
              }, {
                multi: true
              }, function () {
                resolve()
              })
            })
          }).then(function (res) {
            return new Promise(function (resolve) {
              // update picture in groups
              db.groups.update({
                creator_id: request.payload.user_id
              }, {
                $set: user
              }, {
                multi: true
              }, function () {
                resolve()
              })

            })
          }).then(function (res) {
            reply({
              status: 1,
              message: 'User has been updated'
            })
          })
        } else {
          reply({
            status: 1,
            message: 'User has been updated'
          })
        }
      })

    },
    description: 'Update a member in all groups and events',
    notes: "This will update a member's info in all groups and events",
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        user_id: Joi.string().required().description('id of the user'),
        picture_id: Joi.string().description('picture id of the user'),
        old_picture_id: Joi.string().description('old picture id of the user'),
        name: Joi.string().description('name of the user')
      }
    }

  },

  remove: {
    handler: function (request, reply) {
      'use strict'
      if (!request.payload.key || request.payload.key !== process.env.API_KEY) {
        reply('You are not authorized')
      }

      var user = {
        user_id: request.payload.user_id,
        type_id: request.payload.type_id
      }

      db.members.remove(user, function () {
        reply({
          status: 1,
          message: 'User has been removed'
        })
      })

    },
    description: 'Remove member from group or event',
    notes: 'This will remove a member from a group or an event',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        type_id: Joi.string().required().description('id of group or event, e.g group_id or event_id'),
        user_id: Joi.string().required().description('id of the user')
      }
    }

  }

}