'use strict';

let app = require('express')();
let Particle = require('particle-api-js');
let particle = new Particle();

app.post('/:func', function(req, res){
  particle.callFunction({
    deviceId: process.env.PHOTON_ID,
    name: req.params.func,
    argument: req.body.args,
    auth: process.env.PHOTON_TOKEN
  }).then(function(data){
    res.sendStatus(200);
    console.log('Sent ' + req.params.func + '(' + req.body.args + ') => ' + JSON.stringify(data.body.return_value));
  }).catch(function(err){
    res.sendStatus(500);
    console.error('Failed on ' + req.params.func + '(' + req.body.args + '):', err.body.error);
  });
});

module.exports = app;
