'use strict';

let app = require('express')();
let Particle = require('particle-api-js');
let particle = new Particle();

function callPhoton(name, argument){
  return particle.callFunction({
    deviceId: process.env.PHOTON_ID,
    name: name,
    argument: argument,
    auth: process.env.PHOTON_TOKEN
  }).then(function(data){
    console.log('Sent ' + name + '("' + argument + '") => ' + JSON.stringify(data.body.return_value));
  }).catch(function(err){
    console.error('Failed on ' + name + '("' + argument + '"):', err.body.error);
    throw err;
  });
}

app.post('/:func', function(req, res){
  callPhoton(req.params.func, req.body.args)
  .then(()=>res.sendStatus(200))
  .catch(()=>res.sendStatus(500));
});

module.exports = app;
module.exports.callPhoton = callPhoton;
