const { validateResetToken } = require('../Controller/validateResetTokenController')
const { resetPassword } = require('../Controller/resetPasword')
const { register, login, logout, forgotPassword } = require('../Controller/userController')
const { verifyEmail } = require('../Controller/VerificationController')
const { contact } = require('../Controller/contactController')
const router = require('express').Router()

router.post('/register', register)
router.get('/verify-email', verifyEmail)
router.post('/login', login)
router.post('/contact' , contact)
router.post('/forgot-password', forgotPassword)
router.get('/reset-password', validateResetToken)
router.post('/reset-password', resetPassword)
router.post('/logout', logout)

module.exports = router
