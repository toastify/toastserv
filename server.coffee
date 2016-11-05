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

app.get '/', (req, res) ->
	res.sendFile 'static/index.html', { root: '.' }

app.post '/toast/:func', (req, res) ->
  callPhoton req.params.func, req.body.args
  .then (data) ->
    res.send 200, 'Success.'
    console.log 'Sent ' + req.params.func + '(' + req.body.args + ')'
  .catch (err) ->
    res.send 500, 'Error.'
    console.log 'Error sending ' + req.params.func + '(' + req.body.args + '):', err.body.error

app.post '/update', ghHandler, (req, res) ->
  if req.headers['x-github-event'] is not 'push'
    res.status(200).end()
  else
    exec 'git pull && npm install && npm prune', (error, stdout, stderr) ->
      if error then console.log error
      console.log stdout, stderr
    process.exit 0 # PM2 will restart it.

app.use express.static 'static'

app.all '*', (req, res) ->
  res.send 404, '404 Not Found'

app.use (err, req, res, next) ->
  res.send 500, '500 Internal Server Error'

app.listen PORT, 'localhost', ->
	console.log "listening on * : " + PORT
