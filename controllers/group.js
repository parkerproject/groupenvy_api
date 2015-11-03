require('dotenv').load();
var collections = ['groups'];
var mongojs = require("mongojs");
var db = mongojs.connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var randtoken = require('rand-token');


module.exports = {
  create: {
    handler: function (request, reply) {

      "use strict";
      var group = request.payload;
      if (!group.key || group.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      var name = (group.name) ? group.name : "";

      db.groups.find({
        name: name
      }).limit(1, function (err, docs) {

        if (docs.length !== 0) {
          reply({
            status: 0,
            message: 'A group with that name already exists'
          }).type('application/json ');
        } else {
          group.group_id = randtoken.generate(10);
          db.groups.save(group, function (err, result) {
            if (result) {
              reply({
                status: 1,
                message: 'Your new group has been created',
                group_id: group.group_id
              }).type('application/json');
            }
          });
        }

      });
    },

    description: 'Create Group',
    notes: 'Create new Group',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        name: Joi.string().required().description('name of group'),
        group_status: Joi.string().required().description('group status should public or private'),
        picture_id: Joi.string().required().description('image id of group image'),
        creator_id: Joi.string().required().description('id of group creator'),
        creator_name: Joi.string().required().description('name of group creator'),
        date_created: Joi.string().required().description('date that group was created'),
        description: Joi.string().required().description('group description')
      }
    }

  },

  get: {
    handler: function (request, reply) {

      "use strict";
      if (!request.query.key || request.query.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      var groupObject = {};

      if (request.query.group_id) {
        groupObject.group_id = request.query.group_id;
      }

      db.groups.find(groupObject).limit(1, function (err, results) {
        reply(results);
      });
    },
    description: 'Get group',
    notes: 'Returns a group',
    tags: ['api'],

    validate: {
      query: {
        key: Joi.string().required().description('API key to access data'),
        group_id: Joi.string().required().description('id of the group')
      }
    }

  }


};