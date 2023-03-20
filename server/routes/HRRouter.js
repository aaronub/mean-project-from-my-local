const router = require("express").Router();
const HRProfileController = require("../controllers/HRProfileController");
const { authenticateJWT } = require('../middleware/authenticate');
const { authorizationJWT } = require('../middleware/authenticate');
// profile
router.get('/profiles', HRProfileController.getAllProfiles);
router.get('/employee/:id', HRProfileController.getEmployeeById);
router.get('/searchProfiles', HRProfileController.searchProfiles);
router.get('/visas', HRProfileController.getVisas);
router.get('/inProgressVisas', HRProfileController.getInProgressVisa);
router.get('/searchVisa', HRProfileController.getAllProfiles);
router.get('/getAllInvitations', HRProfileController.getAllInvitations)
//application
router.put('/rejectApplication', HRProfileController.rejectApplication);
router.put('/approveApplication', HRProfileController.approveApplication);
router.get('/pending', HRProfileController.getPendingApplication);
router.get('/getApproved', HRProfileController.getApprovedApplication);
router.get('/getRejected', HRProfileController.getRejectedApplication);
//documents
router.post('/reject', HRProfileController.reject);
router.post('/approve', HRProfileController.approve);
router.post('/sendNotification', HRProfileController.sendNotification);
module.exports = router;