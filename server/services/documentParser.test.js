const test = require('node:test');
const assert = require('node:assert/strict');

const { parseFile } = require('./documentParser');

test('parseFile decodes plain text buffers as UTF-8', async () => {
  const text = 'Agreement terms and conditions.';

  assert.equal(await parseFile(Buffer.from(text, 'utf-8'), 'text/plain'), text);
});

test('parseFile rejects unsupported MIME types', async () => {
  await assert.rejects(
    parseFile(Buffer.from('document'), 'application/octet-stream'),
    /Unsupported MIME type: application\/octet-stream/
  );
});