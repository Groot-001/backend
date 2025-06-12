const { createProject, getAllProjects, getUserProjects, joinProjectRequest, handleJoinRequest, updateProject, deleteProject, getAppliedProjects, cancelJoinRequest, getPendingRequests } = require('../Controller/projectController')
const { verifyAccessToken } = require('../Middleware/authMiddleware')

const router = require('express').Router()

router.post('/createProject', verifyAccessToken, createProject)
router.get('/getUserProjects', verifyAccessToken, getUserProjects)
router.get('/getAllProjects', verifyAccessToken, getAllProjects)
router.post('/joinProject/:projectId', verifyAccessToken, joinProjectRequest)

router.get('/pendingrequests', verifyAccessToken, getPendingRequests)
router.post('/handlejoin', verifyAccessToken, handleJoinRequest)
router.get('/getAppliedProjects', verifyAccessToken, getAppliedProjects)
router.put('/updateProject/:projectId', verifyAccessToken, updateProject)
router.delete('/deleteProject/:projectId', verifyAccessToken, deleteProject)
router.post('/cancelrequest', verifyAccessToken, cancelJoinRequest)


module.exports = router
