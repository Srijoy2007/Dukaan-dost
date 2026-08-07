const { parseMessage } = require('./nlpService');
const { parseWithGroq } = require('./groqFallbackService');

const CONFIDENCE_THRESHOLD = 0.75;

const parseMessageWithFallback = async (text, sessionContext = null) => {
  // Always try local first, but pass session context so it can resolve clarifications
  const localResult = parseMessage(text, sessionContext);

  // If local parser resolved it via session context, return immediately
  if (localResult.source && localResult.source.startsWith('session_')) {
    return { ...localResult, source: 'local_session' };
  }

  const shouldEscalate =
    localResult.intent === 'unknown' ||
    (typeof localResult.confidence === 'number' && localResult.confidence < CONFIDENCE_THRESHOLD);

  if (!shouldEscalate) {
    return { ...localResult, source: 'local' };
  }

  // Groq fallback — pass session context too if your groq service supports it
  try {
    const groqResult = await parseWithGroq(text, sessionContext);
    if (groqResult && groqResult.intent !== 'unknown') {
      return { ...groqResult, source: 'groq' };
    }
  } catch (err) {
    console.error('Groq fallback failed:', err.message);
  }

  return { ...localResult, source: 'local_fallback' };
};

module.exports = { parseMessageWithFallback, CONFIDENCE_THRESHOLD };
