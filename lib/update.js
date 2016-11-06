let app = require('express')();

let ghHandler = require('github-webhook-middleware')({
  secret: process.env.GH_SECRET
});

let bluebird = require('bluebird');
let exec = bluebird.promisify(require('child_process').exec);

module.exports = [
  ghHandler,
  function (req, res){
    if(req.headers['x-github-event'] != 'push')
      res.sendStatus(200);
    else
      exec('git fetch --all && git reset --hard origin/master && npm install && npm prune')
      .spread(function(stdout, stderr){
        console.log(stdout, stderr);
        res.sendStatus(200);
        process.exit(0); //PM2 will restart it automatically.
      }).catch(function(err){
        console.error(err);
        res.sendStatus(500);
      });
  }
];
