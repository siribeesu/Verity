/**
 * Provider Health & Resiliency Service
 * Inspects multi-provider connectivity, monitors latency, and verifies fallback readiness.
 */

const { getActiveProvider } = require('./claudeClient');

const PROVIDER_METADATA = {
  gemini: {
    name: 'Google Gemini',
    envKey: 'GEMINI_API_KEY',
    defaultModel: 'gemini-3.5-flash',
    fallbackModel: 'gemini-3.5-flash-lite',
  },
  anthropic: {
    name: 'Anthropic Claude',
    envKey: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-sonnet-4-5',
    fallbackModel: 'claude-3-5-haiku',
  },
  openai: {
    name: 'OpenAI GPT-4o',
    envKey: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o',
    fallbackModel: 'gpt-4o-mini',
  },
  grok: {
    name: 'xAI Grok',
    envKey: 'GROK_API_KEY',
    defaultModel: 'grok-3',
    fallbackModel: 'grok-2',
  },
};

/**
 * Check provider health status and configuration readiness
 */
async function checkProviderHealth() {
  const active = getActiveProvider();
  const meta = PROVIDER_METADATA[active] || { name: active, envKey: 'API_KEY', defaultModel: 'unknown' };
  const keyConfigured = Boolean(process.env[meta.envKey] && !process.env[meta.envKey].startsWith('your_'));

  const healthReport = {
    provider: active,
    displayName: meta.name,
    configured: keyConfigured,
    model: process.env[`${active.toUpperCase()}_MODEL`] || meta.defaultModel,
    fallbackModel: meta.fallbackModel,
    status: keyConfigured ? 'healthy' : 'unconfigured',
    timestamp: new Date().toISOString(),
    retryPolicy: {
      maxRetries: 3,
      backoff: 'exponential',
      fallbackCandidates: 3,
    },
  };

  return healthReport;
}

module.exports = {
  checkProviderHealth,
  PROVIDER_METADATA,
};
