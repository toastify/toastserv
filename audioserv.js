'use strict';

let bluebird = require('bluebird');

let https = require('https');
let fs = require('fs');
let wssServer = https.createServer({
  key: fs.readFileSync('./certs/ec2.clive.io.key'),
  cert: fs.readFileSync('./certs/2_ec2.clive.io.crt'),
  passphrase: process.env.SSL_PASS
}).listen(9001);


let speech = bluebird.promisifyAll(require('@google-cloud/speech')({
  projectId: "53fec4ffc555ac8e653fb867645611e47184d843",
  credentials: require("./keyfile.json")
}));
let recognizeStream = speech.createRecognizeStream({
  config: { encoding: 'LINEAR16', sampleRate: 48000 }
}).on('data', console.log).on('error', console.error);


let BinaryServer = require('binaryjs').BinaryServer;
let wav = require('wav');
let randomstring = require('randomstring');
let binaryServer = new BinaryServer({server: wssServer})
.on('connection', function(client){
  console.log('new connection');
  
  let outFile = randomstring.generate(10) + '.wav';
  
  let fileWriter = new wav.FileWriter(outFile, {
    channels: 1,
    sampleRate: 48000,
    bitDepth: 16
  });
  
  client.on('stream', function(stream, meta){
    console.log('new stream');
    stream.pipe(fileWriter);
    stream.on('end', function(){
      console.log('wrote to file ' + outFile);
      fs.createReadStream(outFile).pipe(recognizeStream);
    });
  });
})
.on('error', function(error){
  console.log(error);
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
