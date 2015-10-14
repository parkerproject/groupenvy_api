require('dotenv').load();
var Joi = require('joi');
var Pusher = require('pusher');
var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  encrypted: true
});
pusher.port = 443;
var Promise = require('es6-promise').Promise;

module.exports = {
  event: {
    handler: function (request, reply) {

      "use strict";
      var eventObj = request.payload;

      return new Promise(function (resolve) {
        pusher.trigger('groupfeed_channel', eventObj.activity_name, {
          "message": eventObj.activity_message
        });
        resolve();
      }).then(function () {
        reply({
          status: 1,
          message: 'message pushed'
        });
      });

    },

    description: 'Activity controller',
    notes: 'Realtime activity controller',
    tags: ['api'],

    validate: {
      payload: {
        key: Joi.string().required().description('API key to access data'),
        activity_name: Joi.string().required().description('name of activity'),
        activity_message: Joi.string().required().description('activity message'),
        user_id: Joi.string().required().description('user id of person that triggered the activity')
      }
    }

  }


};