const { describe, it, afterEach, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { appVersion } = require('../version');

// Clear environment variables that might come from .env file
const envVarsToMock = [
  'AI_PROVIDER',
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
  'OLLAMA_API_BASE_URL',
  'OLLAMA_MODEL',
  'POSTFIX_LOG_PATH',
  'POSTFIX_CONFIG_PATH',
  'TOKEN_SECRET',
  'TOKEN_EXPIRY_HOURS',
  'DASHBOARD_USER',
  'DASHBOARD_PASSWORD',
  'LOG_LEVEL',
  'ENABLE_REQUEST_LOGGING',
  'AI_ANALYSIS_MAX_LOGS',
  'AI_ANALYSIS_DEFAULT_LOGS',
  'AI_ANALYSIS_TIMEOUT',
  'PORT',
  'ALLOWED_ORIGINS',
];

const loadApp = (envVars = {}) => {
  // Start with clean environment - remove all config-related variables
  envVarsToMock.forEach((key) => {
    delete process.env[key];
  });

  // Set only the provided environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });

  // Clear require cache and reload app with mocked env
  delete require.cache[require.resolve('../server')];
  return require('../server');
};

const cleanup = () => {
  // Clear all config-related variables
  envVarsToMock.forEach((key) => {
    delete process.env[key];
  });

  // Clear require cache
  delete require.cache[require.resolve('../server')];
};

describe('GET /api/health', () => {
  afterEach(() => {
    cleanup();
  });

  it('returns ok status and metadata when no AI provider is configured', async () => {
    const app = loadApp({
      // Empty config - no AI provider
    });

    const res = await request(app).get('/api/health');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok(res.body.timestamp, 'should include timestamp');
    assert.ok(res.body.uptime >= 0, 'should include uptime');
    assert.strictEqual(res.body.version, appVersion);
    // When no AI provider is configured, ai property should not be included
    assert.strictEqual(
      res.body.ai,
      undefined,
      'ai property should not be present when no provider is configured',
    );
  });

  it('includes ai property when Gemini AI provider is configured', async () => {
    const app = loadApp({
      AI_PROVIDER: 'gemini',
      GEMINI_API_KEY: 'test-api-key-12345',
    });

    const res = await request(app).get('/api/health');

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.ai, 'ai property should be present when Gemini is configured');
    assert.ok(Array.isArray(res.body.ai.providers), 'ai.providers should be an array');
    assert.strictEqual(typeof res.body.ai.healthy, 'boolean', 'ai.healthy should be a boolean');
    // Verify Gemini provider is in the list
    const geminiProvider = res.body.ai.providers.find((p) => p.provider === 'gemini');
    assert.ok(geminiProvider, 'Gemini provider should be configured');
  });

  it('includes ai property when Ollama AI provider is configured', async () => {
    const app = loadApp({
      AI_PROVIDER: 'ollama',
      OLLAMA_API_BASE_URL: 'http://localhost:11434',
    });

    const res = await request(app).get('/api/health');

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.ai, 'ai property should be present when Ollama is configured');
    assert.ok(Array.isArray(res.body.ai.providers), 'ai.providers should be an array');
    assert.strictEqual(typeof res.body.ai.healthy, 'boolean', 'ai.healthy should be a boolean');
    // Verify Ollama provider is in the list (even if health check failed)
    const ollamaProvider = res.body.ai.providers.find((p) => p.provider === 'ollama');
    assert.ok(ollamaProvider, 'Ollama provider should be configured');
  });

  after(() => {
    // Schedule process exit to run after all tests complete
    setImmediate(() => process.exit(0));
  });
});
