const MAX_DOCUMENT_CHARS = Number(process.env.MAX_DOCUMENT_CHARS || 80000);
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024);

if (!Number.isSafeInteger(MAX_DOCUMENT_CHARS) || MAX_DOCUMENT_CHARS < 50) {
  throw new Error('MAX_DOCUMENT_CHARS must be an integer of at least 50.');
}
if (!Number.isSafeInteger(MAX_UPLOAD_BYTES) || MAX_UPLOAD_BYTES < 1) {
  throw new Error('MAX_UPLOAD_BYTES must be a positive integer.');
}

module.exports = { MAX_DOCUMENT_CHARS, MAX_UPLOAD_BYTES };