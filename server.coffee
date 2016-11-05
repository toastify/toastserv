require('dotenv').config()
express = require 'express'
helmet = require 'helmet'
bodyParser = require 'body-parser'
bluebird = require 'bluebird'
exec = require('child_process').exec
ghHandler = require('github-webhook-middleware')
  secret: process.env.GH_SECRET

speech = require('@google-cloud/speech')
  projectId: "53fec4ffc555ac8e653fb867645611e47184d843"
  credentials: require "./keyfile.json"
bluebird.promisifyAll speech
witClient = new require('node-wit').Wit
  accessToken: process.env.WIT_TOKEN

BinaryServer = require('binaryjs').BinaryServer
wav = require 'wav'
randomstring = require 'randomstring'

PORT = process.env.PORT || 1337

app = express()
app.use helmet()
app.use bodyParser.urlencoded {extended: false}

callPhoton = require './lib/photon'

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

app.use '/static', express.static 'static'

app.all '*', (req, res) ->
  res.sendStatus 404

app.use (err, req, res, next) ->
  res.sendStatus 500

app.listen PORT, 'localhost', ->
	console.log "listening on * : " + PORT



recognizeStream = speech.createRecognizeStream
  config:
    encoding: 'LINEAR16'
    sampleRate: 48000
recognizeStream.on 'data', console.log
recognizeStream.on 'error', console.error

https = require 'https'
fs = require 'fs'
wssServer = https.createServer
  key: fs.readFileSync './certs/ec2.clive.io.key'
  cert: fs.readFileSync './certs/2_ec2.clive.io.crt'
  passphrase: process.env.SSL_PASS
.listen 9001

binaryServer = BinaryServer {server: wssServer}

binaryServer.on 'connection', (client) ->
  console.log 'new connection'
  
  outFile = randomstring.generate(10) + '.wav'
  
  fileWriter = new wav.FileWriter outFile,
    channels: 1,
    sampleRate: 48000,
    bitDepth: 16
  
  client.on 'stream', (stream, meta) ->
    console.log 'new stream'
    stream.pipe fileWriter
    stream.on 'end', ->
      console.log 'wrote to file ' + outFile
      fs.createReadStream(outFile).pipe(recognizeStream)

binaryServer.on 'error', (error) ->
  console.log error

###
  ???
  .then (finishedTranscript) ->
    return witClient.message finishedTranscript, {}
  .then (data) ->
    console.log JSON.stringify data
  .catch console.error
###
