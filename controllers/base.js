require('dotenv').load();
var collections = ['groups'];
var db = require("mongojs").connect(process.env.MONGODB_URL, collections);
var Joi = require('joi');
var _ = require('lodash');
var google = require('google');
var server = require('../server');


module.exports = {
  index: {
    handler: function (request, reply) {

      reply.view('index', {});
    },
    app: {
      name: 'homepage'
    }

  }


};