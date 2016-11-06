'use strict';

let bluebird = require('bluebird');

let https = require('https');
let fs = require('fs');
let wssServer = https.createServer({
  key: fs.readFileSync('./certs/ec2.clive.io.key'),
  cert: fs.readFileSync('./certs/2_ec2.clive.io.crt'),
  passphrase: process.env.SSL_PASS
}).listen(9001);
let BinaryServer = require('binaryjs').BinaryServer;
let wav = require('wav');
let randomstring = require('randomstring');
let binaryServer = new BinaryServer({server: wssServer})
.on('connection', function(client){
  console.log('new connection');
  
  client.on('stream', function(stream){
    console.log('new stream');
    stream.pipe(recognizeStream);
    recognizeStream.pipe(client.createStream());
    
    //
    //recognizeStream.pipe(stream); // Ohhhhh streams are bidirectional
  });
})
.on('error', function(error){
  console.log(error);
});


let speech = bluebird.promisifyAll(require('@google-cloud/speech')({
  projectId: "53fec4ffc555ac8e653fb867645611e47184d843",
  credentials: require("./keyfile.json")
}));
let recognizeStream = speech.createRecognizeStream({
  config: { encoding: 'LINEAR16', sampleRate: 48000 }
});


let witClient = new require('node-wit').Wit({
  accessToken: process.env.WIT_TOKEN
});

/*
  ???
  .then (finishedTranscript) ->
    return witClient.message finishedTranscript, {}
  .then (data) ->
    console.log JSON.stringify data
  .catch console.error
*/
