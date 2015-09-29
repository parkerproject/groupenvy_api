require('dotenv').load();
var collections = ['comments'];
var db = require("mongojs").connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var server = require('../server');


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

    description: 'Post comment',
    notes: 'Post a comment',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        comment: Joi.string().required().description('comment to post'),
        user_id: Joi.string().required().description('user id of commentator'),
        user_name: Joi.string().required().description('name of commentator'),
        group_id: Joi.string().required().description('group id')
      }
    }

  }


};