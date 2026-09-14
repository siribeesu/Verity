const MAX_CHUNK_CHARS = 8000;
const OVERLAP_CHARS = 200;

/**
 * Split document text into sections of roughly MAX_CHUNK_CHARS characters.
 * Prefers splitting at double-newlines (paragraph/section boundaries).
 * @param {string} text
 * @returns {string[]}
 */
function chunk(text) {
  if (text.length <= MAX_CHUNK_CHARS) return [text];

  const sections = text.split(/\n{2,}/);
  const chunks = [];
  let current = '';

  for (const section of sections) {
    const candidate = current ? current + '\n\n' + section : section;
    if (candidate.length > MAX_CHUNK_CHARS && current) {
      chunks.push(current);
      // Start new chunk with overlap from end of previous
      const overlap = current.slice(-OVERLAP_CHARS);
      current = overlap + '\n\n' + section;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);

  return chunks;
}

/**
 * Score a chunk's relevance to a query using simple keyword overlap (TF-IDF-lite).
 * @param {string} chunkText
 * @param {string} query
 * @returns {number}
 */
function scoreChunk(chunkText, query) {
  const stopWords = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','is','are',
    'was','were','be','been','being','have','has','had','do','does','did','will',
    'would','could','should','may','might','can','this','that','these','those',
    'i','you','he','she','it','we','they','what','which','who','when','where',
    'how','why','any','all','with','from','not','by','as','if',
  ]);

  const tokenize = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

  const queryTokens = new Set(tokenize(query));
  const chunkTokens = tokenize(chunkText);

  let score = 0;
  for (const token of chunkTokens) {
    if (queryTokens.has(token)) score++;
  }
  return score;
}

/**
 * Return the top-k most relevant chunks for a given query.
 * @param {string[]} chunks
 * @param {string} query
 * @param {number} k
 * @returns {string[]}
 */
function retrieveRelevant(chunks, query, k = 3) {
  if (chunks.length <= k) return chunks;

  const scored = chunks.map((c, i) => ({ i, score: scoreChunk(c, query), text: c }));
  scored.sort((a, b) => b.score - a.score);

  // Return top-k in original order for coherence
  const topIndices = new Set(scored.slice(0, k).map((s) => s.i));
  return chunks.filter((_, i) => topIndices.has(i));
}

module.exports = { chunk, retrieveRelevant };
