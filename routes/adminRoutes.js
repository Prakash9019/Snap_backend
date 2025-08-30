const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { adminUpload, gcsUpload } = require('../middleware/uploadMiddleware');

const { getDashboardStats } = require('../controllers/dashboardController');
const {
    createCampaign,
    updateCampaign,
    getAllCampaigns,
    getMyCampaigns
} = require('../controllers/campaignController');
const {
    getSubmissionsForCampaign,
    getSubmissionById,
    approveSubmission,
    rejectSubmission,
    markSubmissionAsViewed,
    getPendingTransfers,
    processTransfer
} = require('../controllers/adminController');

// Dashboard
router.route('/dashboard').get(protect, admin, getDashboardStats);

// Campaign Management
router.route('/campaigns').post(protect, admin, adminUpload, gcsUpload, createCampaign).get(protect, admin, getAllCampaigns);
router.route('/campaigns/my-campaigns').get(protect, admin, getMyCampaigns);
router.route('/campaigns/:id').put(protect, admin, adminUpload, gcsUpload, updateCampaign);

// Review Management
router.route('/campaigns/:campaignId/submissions').get(protect, admin, getSubmissionsForCampaign);
router.route('/submissions/:id').get(protect, admin, getSubmissionById);
router.route('/submissions/:id/approve').post(protect, admin, approveSubmission);
router.route('/submissions/:id/reject').post(protect, admin, rejectSubmission);
router.route('/submissions/:id/view').post(protect, admin, markSubmissionAsViewed);

// Transfer Management
router.route('/transfers/pending').get(protect, admin, getPendingTransfers);
router.route('/transfers/:submissionId/process').post(protect, admin, processTransfer);

module.exports = router;