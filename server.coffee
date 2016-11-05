require('dotenv').config()
express = require 'express'
http = require('http').Server(app)
helmet = require 'helmet'
bodyParser = require 'body-parser'
Particle = require 'particle-api-js'
exec = require('child_process').exec
ghHandler = require('github-webhook-middleware')
  secret: process.env.GH_SECRET

PORT = process.env.PORT || 1337

app = express()
app.use helmet()
app.use bodyParser.urlencoded {extended: false}

particle = new Particle()

callPhoton = (name, argument) ->
  particle.callFunction
    deviceId: process.env.PHOTON_ID
    name: name
    argument: argument
    auth: process.env.PHOTON_TOKEN
  .then (data) ->
    console.log 'Sent ' + name + '(' + argument + ') = ' + JSON.stringify data.body.return_value

app.get '/', (req, res) ->
	res.sendFile 'static/index.html', { root: '.' }

app.post '/toast/:func', (req, res) ->
  callPhoton req.params.func, req.body.args
  .then (data) ->
    res.sendStatus 200
  .catch (err) ->
    res.sendStatus 500
    console.log 'Error sending ' + req.params.func + '(' + req.body.args + '):', err.body.error

app.post '/update', ghHandler, (req, res) ->
  if req.headers['x-github-event'] is not 'push'
    res.sendStatus 200
  else
    exec 'git fetch --all && git reset --hard origin/master && npm install && npm prune', (error, stdout, stderr) ->
      if error then console.log error
      console.log stdout, stderr
      res.sendStatus 200
      process.exit 0 # PM2 will restart it.

app.all '*', (req, res) ->
  res.sendStatus 404

app.use (err, req, res, next) ->
  res.sendStatus 500

app.listen PORT, 'localhost', ->
	console.log "listening on * : " + PORT
