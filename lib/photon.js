'use strict';

let Particle = require('particle-api-js');
let particle = new Particle();

module.exports = function(name, argument){
  particle.callFunction({
    deviceId: process.env.PHOTON_ID,
    name: name,
    argument: argument,
    auth: process.env.PHOTON_TOKEN
  }).then(function(data){
    console.log('Sent ' + name + '(' + argument + ') = ' + JSON.stringify(data.body.return_value));
  });
}
