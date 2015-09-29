require('dotenv').load();
var collections = ['groups'];
var db = require("mongojs").connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var google = require('google');
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

    validate: {
      payload: {
        key: Joi.string().required(),
        name: Joi.string().required(),
        public: Joi.string().required(),
        picture_id: Joi.string().required(),
        creator: Joi.string().required(),
        date_created: Joi.string().required(),
        members: Joi.array()
      }
    }

  }


};