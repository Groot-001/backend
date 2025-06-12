const { verifyAdmin } = require('../Middleware/isAdmin')

const router = require('express').Router()

router.post('/verify' , verifyAdmin)

module.exports = router
