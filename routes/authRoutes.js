const express = require('express');
const router = express.Router();
const {
    sendEmailOtp,
    verifyEmailOtp,
    sendOtp,
    verifyOtp,
    registerEmail,
    loginEmail,
    loginGoogle,
    loginPhoneFirebase,
    adminSignup,
    adminLogin,
    adminForgotPassword,
    adminResetPassword
} = require('../controllers/authController');

// User OTP and Auth
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post('/send-otp', sendOtp);
router.post('/login-phone-firebase', loginPhoneFirebase);
router.post('/verify-otp', verifyOtp);
router.post('/register-email', registerEmail);
router.post('/login-email', loginEmail);
router.post('/login-google', loginGoogle);

// Admin Auth
router.post("/admin-signup", adminSignup);
router.post("/admin-login", adminLogin);
router.post('/admin-forgot-password', adminForgotPassword);
router.post('/admin-reset-password', adminResetPassword);

module.exports = router;
