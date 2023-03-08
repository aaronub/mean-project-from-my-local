const router = require("express").Router();
const HRProfileController = require("../controllers/HRProfileController");
const { authenticateJWT } = require('../middleware/authenticate');
const { authorizationJWT } = require('../middleware/authenticate');
// profile
router.get('/profiles', HRProfileController.getAllProfiles);
router.get('/searchProfiles', HRProfileController.searchProfiles);
// router.get('/visas', HRProfileController.ge);
router.get('/searchVisa', HRProfileController.getAllProfiles);
router.get('/getAllInvitations', HRProfileController.getAllInvitations)

module.exports = router;