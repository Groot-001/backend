const mongoose = require('mongoose')
require('dotenv').config();

const connection = process.env.CONNECTIONSTRING

mongoose.connect(connection)
    .then(() => {
        console.log(`Connected to db Successfully !`)
    })
    .catch(error => {
        console.log(`Error connecting ${error}`)
    })