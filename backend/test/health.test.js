const { describe, it, afterEach, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { appVersion } = require('../version');

// Mock environment variables for clean test state
const mockEnv = (envVars = {}) => {
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

  // Clear all config variables
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
};

let currentServer = null;

describe('GET /api/health', () => {
  beforeEach(() => {
    // Clear the app module cache before each test to ensure fresh configuration
    delete require.cache[require.resolve('../server')];
  });

  afterEach(async () => {
    // Stop the server after each test
    if (currentServer) {
      await new Promise((resolve) => {
        currentServer.close(() => resolve());
      });
      currentServer = null;
    }
  });

  it('returns ok status and metadata when no AI provider is configured', async () => {
    mockEnv({});

    const app = require('../server');
    const { startServer } = require('../server');
    const server = startServer();
    currentServer = server;

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
    mockEnv({
      AI_PROVIDER: 'gemini',
      GEMINI_API_KEY: 'test-api-key-12345',
    });

    const app = require('../server');
    const { startServer } = require('../server');
    const server = startServer();
    currentServer = server;

    const res = await request(app).get('/api/health');

    // With fake API key, health check should fail, resulting in 503
    assert.strictEqual(res.status, 503);
    assert.strictEqual(res.body.status, 'degraded');
    assert.ok(res.body.ai, 'ai property should be present when Gemini is configured');
    assert.ok(Array.isArray(res.body.ai.providers), 'ai.providers should be an array');
    assert.strictEqual(res.body.ai.healthy, false, 'ai.healthy should be false with fake API key');
    // Verify Gemini provider is in the list
    const geminiProvider = res.body.ai.providers.find((p) => p.provider === 'gemini');
    assert.ok(geminiProvider, 'Gemini provider should be configured');
    assert.strictEqual(
      geminiProvider.healthy,
      false,
      'Gemini should be unhealthy with fake API key',
    );
    assert.ok(geminiProvider.error, 'Gemini provider should have error message');
  });

  it('includes ai property when Ollama AI provider is configured', async () => {
    mockEnv({
      AI_PROVIDER: 'ollama',
      OLLAMA_API_BASE_URL: 'http://localhost:11434',
    });

    const app = require('../server');
    const { startServer } = require('../server');
    const server = startServer();
    currentServer = server;

    const res = await request(app).get('/api/health');

    // Ollama not actually running, so health check should fail, resulting in 503
    assert.strictEqual(res.status, 503);
    assert.strictEqual(res.body.status, 'degraded');
    assert.ok(res.body.ai, 'ai property should be present when Ollama is configured');
    assert.ok(Array.isArray(res.body.ai.providers), 'ai.providers should be an array');
    assert.strictEqual(
      res.body.ai.healthy,
      false,
      'ai.healthy should be false when Ollama is unreachable',
    );
    // Verify Ollama provider is in the list (even if health check failed)
    const ollamaProvider = res.body.ai.providers.find((p) => p.provider === 'ollama');
    assert.ok(ollamaProvider, 'Ollama provider should be configured');
    assert.strictEqual(
      ollamaProvider.healthy,
      false,
      'Ollama should be unhealthy when unreachable',
    );
    assert.ok(ollamaProvider.error, 'Ollama provider should have error message');
  });
});
