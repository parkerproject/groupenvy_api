'use strict'
require('dotenv').load()
const swig = require('swig')
const sendEmail = require('./send_email')
module.exports = {
  welcome: {
    handler: (request, reply) => {
      if (!request.payload.key || request.payload.key !== process.env.API_KEY) {
        reply('You need an api key to access data')
      }
      let subject = 'Welcome to Groupenvy'
      let email = request.payload.email
      swig.renderFile(appRoot + '/views/welcome.html', {
        name: request.payload.name,
        email: email
      }, function (err, content) {
        if (err) {
          throw err
        }
        sendEmail(email, subject, content)
        reply({
          message: 'Email sent'
        })
      })
    }
  },
  report: {
    handler: (request, reply) => {
      if (!request.payload.key || request.payload.key !== process.env.API_KEY) {
        reply('You need an api key to access data')
      }
      let subject = `URGENT:${request.payload.subject}`
      let content = request.payload.content

      sendEmail('support@groupenvy.com', subject, content)
      reply({
        message: 'Email sent'
      })

    }
  }
}
