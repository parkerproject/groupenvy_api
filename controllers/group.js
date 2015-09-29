require('dotenv').load();
var collections = ['groups'];
var db = require("mongojs").connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var server = require('../server');


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
          db.groups.save(group, function (err, result) {
            if (result) {
              reply({
                status: 1,
                message: 'Your new group has been created'
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
        public: Joi.string().required().description('boolean; true or false'),
        picture_id: Joi.string().required().description('image id of group image'),
        creator_id: Joi.string().required().description('id of group creator'),
        creator_name: Joi.string().required().description('name of group creator'),
        date_created: Joi.string().required().description('date that group was created'),
        description: Joi.string().required().description('group description')
      }
    }

  }


};