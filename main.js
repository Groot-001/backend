const express = require('express')
const cors = require('cors');
const app = express()
const cookieParser = require('cookie-parser');
require('dotenv').config()
const port = process.env.PORT
require('./Connections/connection')

app.use(cookieParser());

app.use(cors({
    origin: 'https://campus-collav.netlify.app/',
    credentials: true,
}));


app.use(express.json());

const userRoutes = require('./Routes/userRoutes')
const refreshRoutes = require('./Routes/refreshTokenRoute')
const projectRoutes = require('./Routes/projectRoutes')
const adminRoutes = require('./Routes/adminRoutes')

app.use(userRoutes)
app.use(refreshRoutes)
app.use(projectRoutes)
app.use(adminRoutes)

app.listen(port, () => {
    console.log(`App running on port ${port}`)
})
