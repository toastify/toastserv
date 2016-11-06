'use strict';

const edibles = ["tomato", "lettuce", "cheese", "mayonnaise", "soylent", "WD-40"];

let bluebird = require('bluebird');

let callPhoton = require('./lib/photon').callPhoton;

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
    let transcribed = "";
    console.log('new stream');
    stream.pipe(speech_to_text.createRecognizeStream({
      content_type: 'audio/l16; rate=44100'
    })).on('data', function(data){
      transcribed += String.fromCharCode.apply(null, new Uint8Array(data));
    }).on('end', function(){
      console.log(transcribed);
      witClient.message(transcribed, {})
      .then(function(data){
        if(data.entities.intent && data.entities.intent[0].value.indexOf("sandwich") != -1){
          let toSend = [];
          if(data.entities.option)
            data.entities.option.forEach(opt => {
              let valid = false;
              edibles.forEach((edible, index) => {
                if(!valid && edible.indexOf(opt.value) != -1 && edible.length < opt.value.length + 4){
                  toSend.push(index);
                  valid = true;
                }
              });
              if(!valid)
                console.log("notice: the option '" + opt.value + "' wasn't a valid food");
            });
          
          if(toSend.length > 0)
            callPhoton('makeSandwich', JSON.stringify({length: toSend.length, data: toSend}))
            .catch(console.error); // "error: sending to sandwichmaker"
          else
            console.error("error: you need to ask for at least one valid item");
        }
        else console.error("error: you didn't ask for a sandwich");
        
      }).catch(console.error);
    });
    
    // Ohhhhh streams are bidirectional
  });
})
.on('error', function(error){
  console.log(error);
});

let SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var speech_to_text = new SpeechToTextV1({
  username: process.env.BLUEMIX_USER,
  password: process.env.BLUEMIX_PASSWORD
});

/*let speech = bluebird.promisifyAll(require('@google-cloud/speech')({
  projectId: "53fec4ffc555ac8e653fb867645611e47184d843",
  credentials: require("./keyfile.json")
}));
let recognizeStream = speech.createRecognizeStream({
  config: { encoding: 'LINEAR16', sampleRate: 48000 }
});*/


let witClient = new require('node-wit').Wit({
  accessToken: process.env.WIT_TOKEN
});
