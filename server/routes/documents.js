const express = require('express');
const router = express.Router();
const {
  saveDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  saveComparison,
  getComparisons,
  deleteComparison,
} = require('../services/documentStore');
const { logAuditEvent } = require('../services/auditLogger');

// GET /api/documents - List all saved contracts
router.get('/', (_req, res) => {
  const docs = getDocuments(100);
  res.json({ status: 'ok', count: docs.length, documents: docs });
});

// POST /api/documents - Save an analyzed contract
router.post('/', (req, res) => {
  const { title, docType, jurisdiction, text, result, tags } = req.body;
  if (!text || !result) {
    return res.status(400).json({ error: 'Text and analysis result are required to save a document.' });
  }

  const saved = saveDocument({ title, docType, jurisdiction, text, result, tags });
  logAuditEvent({
    action: 'DOCUMENT_SAVED',
    ip: req.ip,
    details: { docId: saved.id, version: saved.version, docType: saved.docType },
  });

  res.status(201).json({ status: 'saved', document: saved });
});

// GET /api/documents/comparisons - List saved contract comparisons
router.get('/comparisons', (_req, res) => {
  const comps = getComparisons(50);
  res.json({ status: 'ok', count: comps.length, comparisons: comps });
});

// POST /api/documents/comparisons - Save a comparison
router.post('/comparisons', (req, res) => {
  const { title, docType, textA, textB, result } = req.body;
  if (!textA || !textB || !result) {
    return res.status(400).json({ error: 'Document texts and comparison result are required.' });
  }
  const saved = saveComparison({ title, docType, textA, textB, result });
  logAuditEvent({
    action: 'COMPARISON_SAVED',
    ip: req.ip,
    details: { compId: saved.id, docType: saved.docType },
  });
  res.status(201).json({ status: 'saved', comparison: saved });
});

// DELETE /api/documents/comparisons/:id
router.delete('/comparisons/:id', (req, res) => {
  const deleted = deleteComparison(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Comparison not found.' });
  res.json({ status: 'deleted', id: req.params.id });
});

// GET /api/documents/:id - Get full document details
router.get('/:id', (req, res) => {
  const doc = getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found.' });
  res.json({ status: 'ok', document: doc });
});

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', (req, res) => {
  const deleted = deleteDocument(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Document not found.' });
  logAuditEvent({
    action: 'DOCUMENT_DELETED',
    ip: req.ip,
    details: { docId: req.params.id },
  });
  res.json({ status: 'deleted', id: req.params.id });
});

module.exports = router;
