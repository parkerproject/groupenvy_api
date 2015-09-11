require('dotenv').load();
var collections = ['events'];
var db = require("mongojs").connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var google = require('google');
var server = require('../server');


module.exports = {
  create: {
    handler: function (request, reply) {

      "use strict";
      var _event = request.payload;
      var geo = _event.geo.split(',');
      _event.loc = {
        type: "Point",
        coordinates: [Number(geo[0]), Number(geo[1])]
      };

      db.events.find({
        name: _event.name
      }).limit(1, function (err, docs) {

        if (docs.length !== 0) {
          reply({
            status: 0,
            message: 'An event with that name already exists'
          }).type('application/json ');
        } else {
          db.events.save(_event, function (err, result) {
            if (result) {
              reply({
                status: 1,
                message: 'Your new event has been created'
              }).type('application/json');
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