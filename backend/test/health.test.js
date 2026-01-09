const { describe, it, afterEach } = require('node:test');
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

let lastCleanup = Promise.resolve();

const loadApp = async (envVars = {}) => {
  // Wait for previous cleanup to complete before starting new server
  await lastCleanup;

  // Start with clean environment - remove all config-related variables
  envVarsToMock.forEach((key) => {
    delete process.env[key];
  });

  // Always prefer ephemeral port for tests unless explicitly provided
  const mergedEnv = { PORT: '0', ...envVars };

  // Set only the provided environment variables
  Object.entries(mergedEnv).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });

  // Clear require cache BEFORE loading app
  delete require.cache[require.resolve('../server')];

  // Load the app - this starts the server immediately
  const appModule = require('../server');
  const server = appModule.server;

  // Wait for the server to start listening
  return new Promise((resolve) => {
    if (server.listening) {
      resolve({ app: appModule, server });
    } else {
      server.once('listening', () => {
        resolve({ app: appModule, server });
      });
    }
  });
};

let currentServer = null;

const cleanup = async () => {
  if (currentServer) {
    // Close the server and wait for it to fully close
    await new Promise((resolve) => {
      // Destroy all active connections
      if (currentServer.closeAllConnections) {
        currentServer.closeAllConnections();
      }

      currentServer.close((_err) => {
        // Ignore close errors
        resolve();
      });
    });

    currentServer = null;
  }

  // Clear all config-related variables
  envVarsToMock.forEach((key) => {
    delete process.env[key];
  });

  // Clear require cache to ensure fresh server instance next time
  delete require.cache[require.resolve('../server')];
};

describe('GET /api/health', () => {
  afterEach(async () => {
    // Store the cleanup promise so the next test waits for it
    lastCleanup = cleanup();
    await lastCleanup;
  });

  it('returns ok status and metadata when no AI provider is configured', async () => {
    const { app, server } = await loadApp({
      // Empty config - no AI provider
    });

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
    const { app, server } = await loadApp({
      AI_PROVIDER: 'gemini',
      GEMINI_API_KEY: 'test-api-key-12345',
    });

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
    const { app, server } = await loadApp({
      AI_PROVIDER: 'ollama',
      OLLAMA_API_BASE_URL: 'http://localhost:11434',
    });

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
