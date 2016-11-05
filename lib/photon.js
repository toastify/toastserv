'use strict';

let app = require('express')();
let Particle = require('particle-api-js');
let particle = new Particle();

function callPhoton(name, argument){
  particle.callFunction({
    deviceId: process.env.PHOTON_ID,
    name: name,
    argument: argument,
    auth: process.env.PHOTON_TOKEN
  }).then(function(data){
    console.log('Sent ' + name + '(' + argument + ') => ' + JSON.stringify(data.body.return_value));
  }).catch(function(err){
    console.error('Failed on ' + name + '(' + argument + '):', err);
    throw err;
  });
}

app.post('/:func', function(req, res){
  callPhoton(req.params.func, req.body.args)
  .then(function(data){
    res.sendStatus(200);
  }).catch(function(err){
    res.sendStatus(500);
    console.error('Error sending ' + req.params.func + '(' + req.body.args + '):', err.body.error);
  });
});

module.exports = app;
