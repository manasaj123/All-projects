// src/routes/approvalWorkflow.js
const express = require('express');
const router = express.Router();

const approvalWorkflowController = require('../controllers/approvalWorkflowController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// create/update workflow definition
router.post(
  '/:workflowInstanceId/decision',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'APPROVER'),
  approvalWorkflowController.takeDecision
);

// list workflows
router.get(
  '/pending',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'APPROVER'),
  approvalWorkflowController.listPendingApprovals
);

// submit a document into workflow
router.post(
  '/submit',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  approvalWorkflowController.submitForApproval
);

// approve / reject
router.post(
  '/:workflowInstanceId/decision',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'APPROVER'),
  approvalWorkflowController.takeDecision
);

module.exports = router;