require('dotenv').load();
var collections = ['comments'];
var db = require("mongojs").connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var google = require('google');
var server = require('../server');
var Joi = require('joi');


module.exports = {
  create: {
    handler: function (request, reply) {

      "use strict";
      var commentObj = request.payload;
      if (!commentObj.key || commentObj.key !== process.env.API_KEY) {
        reply('You are not authorized');
      }

      db.comments.save(commentObj, function (err, result) {
        if (result) {
          reply({
            status: 1,
            message: 'Your new comment has been added'
          }).type('application/json');
        }
      });
    },

    validate: {
      payload: {
        key: Joi.string().required(),
        comment: Joi.string().required(),
        user_id: Joi.string().required(),
        group_id: Joi.string().required()
      }
    }

  }


};