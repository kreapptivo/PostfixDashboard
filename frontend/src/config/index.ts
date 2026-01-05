// ============================================
// FILE: frontend/src/config/index.ts
// ============================================
// Path: postfix-dashboard/frontend/src/config/index.ts

import appVersion from './version';

// Centralized configuration
const config = {
  api: {
    // API calls always use /api path
    // Development: Vite proxy redirects /api to http://backend:3001
    // Production: Reverse proxy redirects /api to backend container
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  },
  auth: {
    tokenKey: 'postfix_auth_token',
    tokenExpiryKey: 'postfix_token_expiry',
    expiryHours: parseInt(import.meta.env.VITE_TOKEN_EXPIRY_HOURS || '24'),
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Postfix Dashboard',
    version: appVersion,
  },
  pagination: {
    defaultPageSize: 50,
    pageSizeOptions: [25, 50, 100, 200],
  },
} as const;

export { config };

export default config;
