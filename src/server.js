const Pusher = require('pusher');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const pusher = new Pusher({
    appId: '553065',
    key: 'bfd38bdadf2ce4d78439',
    secret: 'b9bcb9be013ae0f99fbe',
    cluster: 'eu',
    encrypted: true
});
app.set('PORT', process.env.PORT || 5000);

app.post('/action', (req, res) => {
    const payload = req.body;
    let socketId = req.body.socketId;
    pusher.trigger('sneak-move', 'move', payload, socketId);
    res.send(payload)
});

app.post('/point', (req, res) => {
    const payload = req.body;
    pusher.trigger('sneak-move', 'point', payload);
    res.send(payload)
});

app.post('/player_1', (req, res) => {
    const payload = req.body;
    pusher.trigger('sneak-move', 'player_1', payload);
    res.send(payload)
});

app.post('/player_2', (req, res) => {
    const payload = req.body;
    pusher.trigger('sneak-move', 'player_2', payload);
    res.send(payload)
});

app.post('/game_status_changed', (req, res) => {
    const payload = req.body;
    pusher.trigger('sneak-move', 'game_status_changed', payload);
    res.send(payload)
});

app.listen(app.get('PORT'), () =>
    console.log('Listening at ' + app.get('PORT')))