'use strict';

const intent = ["sandwich"];
const edibles = [
  ["peppers"],
  ["pepperoni"],
  ["sausage"],
  ["veggie blend"]
];

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
const speech = require('@google-cloud/speech')({keyFilename: 'keyfile.json'});
let binaryServer = new BinaryServer({server: wssServer})
.on('connection', function(client){
  console.log('new connection');
  
  let outFile = './' + randomstring.generate(10) + '.wav';
  
  client.on('stream', function(stream){
    console.log('new stream and recognizeStream');
    /*stream
      .on('data', () => console.log('- stream datum'))
      .on('end', () =>{
        console.log('end stream');
        speech.recognize(outFile,
          {encoding:'LINEAR16', sampleRate: 16000, verbose: true},
          function(err, results, apiResponse){
            if(err) return console.error("RETURNED! ERROR:", err);
            console.log("RETURNED!", err, results, apiResponse);
            client.createStream().write(results);
          });
      })
      .on('*', () => console.log('ANY event stream'))
    .pipe(fs.createWriteStream(outFile));*/
    
    stream
      .on('end', () => console.log('end stream'))
    .pipe(speech.createRecognizeStream({
      config: {encoding: 'LINEAR16', sampleRate: 48000}, //might be 44100?
      interim_results: true
    }))
      .on('error', console.error)
      .on('data', (transcribed) => {
        console.log(transcribed);
        if(!transcribed.results.is_final) return;
        console.log('END recognizeStream');
        console.log(transcribed);
        witClient.message(transcribed, {})
        .then(function(data){
          if(data.entities.intent && intent.includes(data.entities.intent[0].value)){
            let toSend = [];
            if(data.entities.option)
              data.entities.option.forEach(opt => {
                let valid = false;
                edibles.forEach((edible, index) => {
                  if(!valid && edible.includes(opt.value)){
                    if(!toSend.includes(index))
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
      })
      .pipe(client.createStream());
    
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
