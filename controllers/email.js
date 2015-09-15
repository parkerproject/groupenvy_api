require('dotenv').load();
var collections = ['users'];
var db = require("mongojs").connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');


module.exports = {
  send: {
    handler: function (request, reply) {

      "use strict";
      var email = request.payload;

      db.users.find({
        email: email
      }).limit(1, function (err, docs) {

        if (docs.length !== 0) {
          reply('You have successful signed up for early access');
        } else {
          db.users.save(email, function (err, result) {
            if (result) {
              reply('You have successful signed up for early access');
            }
          });
        }

      });
    },

    validate: {
      query: {}
    }

  }


};