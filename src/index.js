const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/covidtally").then(() => console.log('connected to MongoDb')).catch((err) => console.log('exception', err));
const port = 8080

// Parse JSON bodies (as sent by API clients)

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')
app.get('/totalRecovered', (req, res) => {
    connection.aggregate(([{
        $group: {
            _id: null,
            totalRecovered: { $sum: '$recovered' }
        }
    }])).then((result, rej) => {
        let response = {
            "data": {
                _id: "total",
                recovered: result[0]['totalRecovered']
            }
        }
        res.json(response);
    })
})

app.get("/totalActive", (req, res) => {
    connection.aggregate(([{
        $group: {
            _id: null,
            active: {
                $sum: {
                    $subtract: ["$infected", "$recovered"]
                }
            }
        }
    }])).then((result, rej) => {
        let response = {
            "data": {
                _id: 'total',
                active: result[0]['active']
            }
        }
        res.json(response)
    })
})

app.get("/totalDeath", (req, res) => {
    connection.aggregate(([{
        $group: {
            _id: null,
            death: { $sum: '$death' }
        }
    }])).then((result, rej) => {
        let response = {
            "data": {
                _id: "total",
                death: result[0]['death']
            }
        }
        res.json(response)
    })

})

app.get("/hotspotStates", (req, res) => {
    connection.aggregate(([{
            $project: {
                state: 1,
                rate: {
                    $round: [{
                        $divide: [{ $subtract: ["$infected", "$recovered"] }, "$infected"]
                    }, 5]
                }
            }

        },
        {
            $match: { rate: { $gt: 0.1 } }
        }
    ])).then((result, rej) => {
        let response = result.map((value) => {
            return { state: value['state'], rate: value['rate'] }
        })
        res.json({ "data": response });
    })
})

app.get("/healthyStates", (req, res) => {

    connection.aggregate(([{
        $project:

        {
            state: 1,
            mortality: {
                $round: [
                    { $divide: ["$death", "$infected"] },
                    5
                ]
            }
        }

    }, {
        $match: { mortality: { $lt: 0.005 } }
    }])).then((result, rej) => {
        let response = result.map((value) => {
            return { state: value['state'], mortality: value['mortality'] }
        })
        res.json({ "data": response });
    })
})



app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;