// src/controllers/approvalWorkflowController.js

const db = require('../config/db');
const { ApprovalWorkflow, ApprovalInstance } = db;

exports.listPendingApprovals = async (req, res, next) => {
  try {
    const instances = await ApprovalInstance.findAll({
      where: { status: 'PENDING' },
      order: [['createdAt', 'DESC']]
    });

    const rows = instances.map((inst) => ({
      id: inst.id,
      documentType: inst.documentType,
      documentId: inst.documentId,
      documentNumber: inst.documentId, // simple display
      partyName: null,
      accountName: null,
      amount: inst.amount || 0,
      totalAmount: inst.amount || 0,
      createdAt: inst.createdAt,
      date: null,
      createdByName: 'Unknown',
      narration: inst.remarks || null,
      description: null
    }));

    res.json(rows);
  } catch (err) {
    next(err);
  }
};
exports.createOrUpdateWorkflow = async (req, res, next) => {
  try {
    // simple stub – adapt fields to your model
    const { documentType, levels, active } = req.body;

    const wf = await ApprovalWorkflow.upsert(
      {
        documentType,
        levels: JSON.stringify(levels || []),
        active: active !== false
      },
      { returning: true }
    );

    res.status(201).json(wf[0] || wf);
  } catch (err) {
    next(err);
  }
};

exports.listWorkflows = async (req, res, next) => {
  try {
    const wfs = await ApprovalWorkflow.findAll({
      order: [['documentType', 'ASC']]
    });
    res.json(wfs);
  } catch (err) {
    next(err);
  }
};

// src/controllers/approvalWorkflowController.js
exports.submitForApproval = async (req, res, next) => {
  try {
    const { documentType, documentId, amount } = req.body;

    const workflow = await ApprovalWorkflow.findOne({
      where: { documentType, active: true }
    });

    if (!workflow) {
      return res.status(400).json({ message: 'No workflow configured' });
    }

    const instance = await ApprovalInstance.create({
      documentType,          // e.g., 'INVOICE'
      documentId,            // e.g., invoice.id
      amount,
      status: 'PENDING',
      currentLevel: 1,
      workflowId: workflow.id,
      createdBy: req.user.id   // or a fixed user id if auth not wired
    });

    res.status(201).json(instance);
  } catch (err) {
    next(err);
  }
};
exports.takeDecision = async (req, res, next) => {
  try {
    const { workflowInstanceId } = req.params;
    const { decision, remarks } = req.body;

    const instance = await ApprovalInstance.findByPk(workflowInstanceId);
    if (!instance) {
      return res.status(404).json({ message: 'Workflow instance not found' });
    }

    instance.status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    instance.remarks = remarks || null;
    instance.approvedBy = req.user.id;
    instance.approvedAt = new Date();

    await instance.save();

    res.json(instance);
  } catch (err) {
    next(err);
  }
};