const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/covidtally").then(() => console.log('connected to MongoDb')).catch((err) => console.log('exception', err));
const port = 8080

// Parse JSON bodies (as sent by API clients)
let data = require('./data.js');

data = data['data'];
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')

const schema = new mongoose.Schema({
    state: String,
    infected: Number,
    recovered: Number,
    death: Number
})


function round(value) {
    var decimals = 5;
    var isNegative = value < 0;
    var absolute = Math.round(
        Math.round(
            Math.abs(value) * Math.pow(10, (6))
        ) / Math.pow(10, 6 - decimals)
    ) / Math.pow(10, decimals);
    return isNegative ? -absolute : absolute;
}
const Covid = mongoose.model('covidtallies', schema);

//console.log(data);
const getValue = (ans, param) => {
    let k = ans.reduce((acc, value) => acc + Number(value[param]), 0)
    return k;
}

const getActive = (ans) => {
    let infected = 0;
    let recovered = 0;
    for (let i = 0; i < ans.length; i++) {
        let k = ans[i];
        recovered += Number(k['recovered']);
        infected += Number(k['infected']);
    }
    return infected - recovered;
}
app.get('/totalRecovered', (req, res) => {
    Covid.find({}).then((ans) => res.json({ data: { _id: "total", recovered: getValue(ans, 'recovered') } }))
})
app.get('/totalActive', (req, res) => {
    Covid.find({}).then((ans) => res.json({ data: { _id: "total", active: getActive(ans) } }));
})

app.get('/totalDeath', (req, res) => {
    Covid.find({}).then((ans) => res.json({ data: { _id: 'total', death: getValue(ans, 'death') } }));
})

app.get('/hotspotStates', (req, res) => {
    let dead = [];
    for (let i = 0; i < data.length; i++) {
        let k = data[i];
        let infected = k['infected'];
        let recovered = k['recovered'];
        let diff = Number(infected) - Number(recovered);
        diff = (diff / Number(infected));
        diff = round(diff);
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
        diff = round(diff);
        if (diff < 0.005) {
            dead.push({ state: k['state'], mortality: diff });
        }
    }
    res.json({ data: dead });
})









app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;