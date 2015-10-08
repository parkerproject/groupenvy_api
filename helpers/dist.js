var toRad = require('./to_rad.js');

module.exports = function (start, end, accuracy) {

  'use strict';

  accuracy = Math.floor(accuracy) || 1;

  var Radius = 6378137,
    distance =
    Math.round(
      Math.acos(
        Math.sin(
          toRad(end[1])
        ) *
        Math.sin(
          toRad(start[1])
        ) +
        Math.cos(
          toRad(end[1])
        ) *
        Math.cos(
          toRad(start[1])
        ) *
        Math.cos(
          toRad(start[0]) - toRad(end[0])
        )
      ) * Radius
    );

  return Math.floor(Math.round(distance / accuracy) * accuracy);
};