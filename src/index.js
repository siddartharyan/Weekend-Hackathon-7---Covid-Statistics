const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
let data = require('./data.js');
data = data['data'];
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')
    //console.log(data);
app.get('/totalRecovered', (req, res) => {
    let ans = 0;
    for (let i = 0; i < data.length; i++) {
        let k = data[i];
        ans += Number(k['recovered']);
    }
    res.json({ data: { _id: 'total', recovered: ans } });
})

app.get('/totalActive', (req, res) => {
    let infected = 0;
    let recovered = 0;
    for (let i = 0; i < data.length; i++) {
        let k = data[i];
        recovered += Number(k['recovered']);
        infected += Number(k['infected']);
    }
    res.json({ data: { _id: 'total', active: (infected - recovered) } });
})

app.get('/totalDeath', (req, res) => {
    let dead = 0;
    for (let i = 0; i < data.length; i++) {
        let k = data[i];
        dead += Number(k['death']);
    }
    res.json({ data: { _id: 'total', active: dead } });
})

app.get('/totalDeath', (req, res) => {
    let dead = 0;
    for (let i = 0; i < data.length; i++) {
        let k = data[i];
        dead += Number(k['death']);
    }
    res.json({ data: { _id: 'total', active: dead } });
})

app.get('/hotspotStates', (req, res) => {
    let dead = [];
    for (let i = 0; i < data.length; i++) {
        let k = data[i];
        let infected = k['infected'];
        let recovered = k['recovered'];
        let diff = Number(infected) - Number(recovered);
        diff = (diff / Number(infected));
        diff = diff.toFixed(5);
        console.log(diff);
        if (diff > 0.1) {
            dead.push({ state: k['state'], rate: diff });
        }
    }
    res.json({ data: dead });
})

app.get('/healthyStates', (req, res) => {
    let dead = [];
    for (let i = 0; i < data.length; i++) {
        let k = data[i];
        let infected = k['infected'];
        let death = k['death'];
        let diff = (Number(death) / Number(infected));
        diff = diff.toFixed(5);
        if (diff < 0.05) {
            dead.push({ state: k['state'], mortality: diff });
        }
    }
    res.json({ data: dead });
})









app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;