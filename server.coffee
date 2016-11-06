require('dotenv').config()

require './audioserv'

express = require 'express'
helmet = require 'helmet'
bodyParser = require 'body-parser'

app = express()
app.use helmet()
app.use bodyParser.urlencoded {extended: false}

app.get '/', (req, res) ->
	res.sendFile 'static/index.html', { root: '.' }

app.use '/toast', require './lib/photon'
app.post '/update', require './lib/update'
app.use '/static', express.static 'static'

app.all '*', (req, res) -> res.sendStatus 404
app.use (err, req, res, next) -> res.sendStatus 500

PORT = process.env.PORT || 1337

app.listen PORT, 'localhost', ->
	console.log "listening on * : " + PORT

