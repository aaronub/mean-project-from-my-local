const router = require("express").Router();
const UserController = require("../controllers/UserController");
const { authenticateJWT } = require('../middleware/authenticate');
const { authorizationJWT } = require('../middleware/authenticate');
const { upload } = require('../middleware/aws')


router.post('/register', UserController.user_register)
router.post('/login', UserController.user_login)
router.post('/sendInvitation', UserController.sent_register_invitation)
//onboarding upload
router.post('/profile', authorizationJWT, UserController.profile_upload);
router.post('/emergencyContact_update', authorizationJWT, UserController.emergencyContacts_upload);
// router.post('/profile',UserController.profile_upload);
router.put('/employeeVisa', UserController.employee_updateVisa)
// Housing
// Employee & HR add or update comments
router.put('/report', authorizationJWT, UserController.put_report);
// Employee
router.get('/house', authorizationJWT, UserController.get_house);
router.post('/report', authorizationJWT, UserController.post_report);
router.get('/reports', authorizationJWT, UserController.get_reports);
router.get('/report/:id', authorizationJWT, UserController.get_report);
// HR
router.get('/houses', authorizationJWT, UserController.get_houses);
router.get('/house/:id', authorizationJWT, UserController.get_house_by_id);
router.post('/house', authorizationJWT, UserController.post_house);
router.put('/house', authorizationJWT, UserController.put_house);
router.delete('/house/:id', authorizationJWT, UserController.delete_house);

//AWS s3, unload a file, download a file, list all files
router.post('/upload', upload.single('file'), UserController.user_upload)
router.get("/download/:filename", UserController.download_file)
router.get("/list", UserController.get_fileList)

router.get('/getEmployeeInfo', UserController.get_updated_employee_info)

module.exports = router;
