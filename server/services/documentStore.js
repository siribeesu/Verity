/**
 * Server-Side Persistent Document & Versioning Store
 * Provides persistent storage for analyzed contracts, versioned agreements,
 * and contract comparisons with zero external setup required.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'legalassist_db.json');

// Ensure data directory exists
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = { documents: [], comparisons: [], updatedAt: new Date().toISOString() };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    } catch {}
  }
}

function readDb() {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { documents: [], comparisons: [], updatedAt: new Date().toISOString() };
  }
}

function writeDb(data) {
  ensureStorage();
  try {
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[DocumentStore] Failed to write database:', err.message);
    return false;
  }
}

/**
 * Save an analyzed document. If a document with the same title exists, increments version number.
 */
function saveDocument({ id, title, docType = 'general', jurisdiction = null, text, result, tags = [] }) {
  const db = readDb();
  const cleanTitle = (title || 'Untitled Document').trim();

  // Determine version
  const matching = db.documents.filter((d) => d.title.toLowerCase() === cleanTitle.toLowerCase());
  const version = matching.length > 0 ? matching.length + 1 : 1;

  const docId = id || `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const newDoc = {
    id: docId,
    title: cleanTitle,
    docType,
    jurisdiction,
    version: `v${version}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    text,
    result,
    tags,
    metrics: {
      clauseCount: result?.clauses?.length || 0,
      highRiskCount: result?.clauses?.filter((c) => c.risk === 'high').length || 0,
      mediumRiskCount: result?.clauses?.filter((c) => c.risk === 'medium').length || 0,
      lowRiskCount: result?.clauses?.filter((c) => c.risk === 'low').length || 0,
    },
  };

  db.documents.unshift(newDoc);
  writeDb(db);
  return newDoc;
}

function getDocuments(limit = 50) {
  const db = readDb();
  return db.documents.slice(0, limit).map((d) => ({
    id: d.id,
    title: d.title,
    docType: d.docType,
    jurisdiction: d.jurisdiction,
    version: d.version,
    createdAt: d.createdAt,
    metrics: d.metrics,
    summary: d.result?.summary?.slice(0, 120) + '...',
  }));
}

function getDocumentById(id) {
  const db = readDb();
  return db.documents.find((d) => d.id === id) || null;
}

function deleteDocument(id) {
  const db = readDb();
  const index = db.documents.findIndex((d) => d.id === id);
  if (index === -1) return false;
  db.documents.splice(index, 1);
  writeDb(db);
  return true;
}

function saveComparison({ id, title, docType = 'general', textA, textB, result }) {
  const db = readDb();
  const compId = id || `comp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const newComp = {
    id: compId,
    title: title || (result?.overview ? result.overview.slice(0, 45) + '...' : 'Contract Comparison'),
    docType,
    createdAt: new Date().toISOString(),
    textA,
    textB,
    result,
    differencesCount: result?.differences?.length || 0,
  };
  db.comparisons.unshift(newComp);
  writeDb(db);
  return newComp;
}

function getComparisons(limit = 50) {
  const db = readDb();
  return db.comparisons.slice(0, limit);
}

function deleteComparison(id) {
  const db = readDb();
  const index = db.comparisons.findIndex((c) => c.id === id);
  if (index === -1) return false;
  db.comparisons.splice(index, 1);
  writeDb(db);
  return true;
}

function clearStore() {
  const empty = { documents: [], comparisons: [], updatedAt: new Date().toISOString() };
  writeDb(empty);
  return true;
}

module.exports = {
  saveDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  saveComparison,
  getComparisons,
  deleteComparison,
  clearStore,
};
