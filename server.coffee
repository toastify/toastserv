express = require 'express'
app = express()
http = require('http').Server(app)
helmet = require 'helmet'

PORT = process.env.PORT || 1337

app.use helmet()

app.get '/', (req, res) ->
	res.sendFile 'dist/index.html', { root: '.' }

app.use express.static 'dist'

app.listen PORT, 'localhost', ->
	console.log "listening on * : " + PORT
