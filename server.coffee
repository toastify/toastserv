require('dotenv').config()
express = require 'express'
http = require('http').Server(app)
helmet = require 'helmet'
bodyParser = require 'body-parser'
Particle = require 'particle-api-js'

PORT = process.env.PORT || 1337

app = express()
app.use helmet()
app.use bodyParser.urlencoded {extended: false}

particle = new Particle()

app.get '/', (req, res) ->
	res.sendFile 'static/index.html', { root: '.' }

app.post '/toast', (req, res) ->
  console.log 'Received request, with value: {', req.body.args, '}'
  particle.callFunction
    deviceId: process.env.PHOTON_ID
    name: 'led'
    argument: req.body.args
    auth: process.env.PHOTON_TOKEN
  .then (data) ->
    console.log 'Success.'
    res.send 'Success.'
  .catch (err) ->
    console.log 'Oops ' + JSON.stringify err
    res.send 'Oops ' + JSON.stringify err

app.use express.static 'static'

app.all '*', (req, res) ->
  res.send 404, '404 Not Found'

app.use (err, req, res, next) ->
  res.send 500, '500 Internal Server Error'

app.listen PORT, 'localhost', ->
	console.log "listening on * : " + PORT
