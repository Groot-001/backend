const router = require('express').Router()
const { refreshaccesstoken } = require('../Controller/refreshTokenController')

router.post('/refresh-token', refreshaccesstoken)

module.exports = router