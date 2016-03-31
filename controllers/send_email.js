'use strict'
require('dotenv').load()
const sendgrid = require('sendgrid')(process.env.SENDGRID_KEY)
module.exports = function (email, subject, content) {
  sendgrid.send({
    to: email,
    from: 'support@groupenvy.com',
    fromname: 'Groupenvy',
    subject: subject,
    html: content
  }, function (err, json) {
    if (err) console.log(err)
    console.log(json)
  })
}
