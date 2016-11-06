require('dotenv').config();
require('./audioserv');

const PORT = process.env.PORT || 1337;

let express = require('express');
let helmet = require('helmet');
let bodyParser = require('body-parser');

let app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => res.sendFile('index.html', { root: './static' }));
app.use('/toast', require('./lib/photon'));
app.post('/update', require('./lib/update'));
app.use('/static', express.static('static'));

let callPhoton = require('./lib/photon').callPhoton;
app.get('/td', (req, res) => callPhoton('toast', '{"length": 1, "data": [5]}'));
app.get('/ml', (req, res) => callPhoton('toast', '{"length": 2, "data": [1,4]}'));
app.get('/ag', (req, res) => callPhoton('toast', '{"length": 4, "data": [0,1,4,5]}'));

app.all('*', (req, res) => res.sendStatus(404))
app.use((err, req, res, next) => res.sendStatus(500))

app.listen(PORT, 'localhost', () => console.log("listening on * : " + PORT));
