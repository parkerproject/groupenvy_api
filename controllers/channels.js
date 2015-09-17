require('dotenv').load();
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
        pusher.trigger('groupfeed_channel', eventObj.event, {
          "message": eventObj.message
        });
        resolve();
      }).then(function () {
        reply('message pushed');
      });

    },

    validate: {
      query: {}
    }

  }


};