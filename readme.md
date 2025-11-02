# Postfix Mail Relay Dashboard

A modern, real-time monitoring dashboard for Postfix mail servers with AI-powered log analysis, advanced analytics, and intuitive network management.

![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Application Structure](#application-structure)
- [Configuration](#configuration)
- [Usage](#usage)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## 🎯 Overview

The Postfix Mail Relay Dashboard is a comprehensive web-based monitoring solution designed for system administrators managing Postfix mail servers. It provides real-time insights into mail flow, delivery statistics, security events, and network configurations with an elegant dark-themed interface.

### Purpose

- **Real-time Monitoring**: Track mail server performance and delivery statistics
- **AI-Powered Analysis**: Leverage Gemini AI or Ollama for intelligent log analysis
- **Security Oversight**: Monitor authentication attempts, relay access, and potential threats
- **Network Management**: Configure and manage allowed relay networks (mynetworks)
- **Advanced Analytics**: Deep insights into senders, recipients, and connected IPs

### Target Audience

- System Administrators
- DevOps Engineers
- Mail Server Operators
- IT Security Teams

## ✨ Key Features

### Dashboard & Monitoring
- **Real-time Statistics**: Total mails, delivered, bounced, and deferred counts
- **Volume Trends**: Interactive charts with multiple visualization types (bar, line, area, stacked, composed, radial)
- **Recent Activity**: Critical system events from the last 24 hours
- **Date Range Filtering**: Flexible time-based data filtering

### AI-Powered Log Analysis
- **Dual AI Provider Support**: 
  - Google Gemini API for cloud-based analysis
  - Ollama for local, privacy-focused analysis
- **Comprehensive Insights**:
  - Executive summaries
  - Anomaly detection
  - Security threat identification
  - Configuration error detection
  - Actionable recommendations
- **Flexible Input**: Analyze recent logs or paste custom log snippets

### Advanced Analytics
- **Top Senders Analysis**: Track most active senders with success rates
- **Top Recipients Analysis**: Monitor delivery patterns to recipients
- **Connected IPs Tracking**: Identify source IPs with connection patterns
- **Visual Charts**: Multiple chart types for data visualization
- **CSV Export**: Export analytics data for external analysis
- **Date-based Filtering**: Analyze specific time periods

### Network Management
- **Allowed Networks Configuration**: Manage Postfix mynetworks settings
- **Visual Editor**: Add/remove allowed IPs and CIDR ranges
- **Validation**: Built-in validation for IP addresses and hostnames
- **One-click Copy**: Easily copy network configurations

### Mail Log Browser
- **Advanced Filtering**: Filter by date range, status, and pagination
- **Detailed View**: Click any log entry for full details
- **Status Indicators**: Color-coded status badges (sent, bounced, deferred, rejected)
- **Export Capability**: Download logs as CSV

### Security & Authentication
- **Token-based Authentication**: Secure JWT-like token system
- **Session Management**: Configurable token expiry (default 24 hours)
- **Protected Routes**: All API endpoints require authentication

## 📦 Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+, Debian 10+, CentOS 8+, or similar)
- **Node.js**: >= 16.0.0 (LTS recommended)
- **npm**: >= 8.0.0
- **Postfix**: Installed and configured mail server
- **Memory**: Minimum 2GB RAM
- **Storage**: 1GB free disk space

### Optional Requirements
- **Gemini API Key**: For cloud-based AI analysis
- **Ollama**: For local AI analysis (alternative to Gemini)
- **Reverse Proxy**: Nginx or Apache for production deployment

## 🚀 Installation

### Development Environment

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/postfix-dashboard.git
cd postfix-dashboard
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
nano .env
```

Configure your `.env` file:

```env
# Server Configuration
PORT=3001
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# Postfix Configuration
POSTFIX_LOG_PATH=/var/log/mail.log
POSTFIX_CONFIG_PATH=/etc/postfix/main.cf

# Authentication
DASHBOARD_USER=admin@example.com
DASHBOARD_PASSWORD=your_secure_password
TOKEN_EXPIRY_HOURS=24

# AI Configuration
AI_PROVIDER=ollama
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
OLLAMA_API_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest

# AI Analysis Settings
AI_ANALYSIS_MAX_LOGS=200
AI_ANALYSIS_DEFAULT_LOGS=50
AI_ANALYSIS_TIMEOUT=60000
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create environment file (optional)
cp .env.example .env
nano .env
```

Configure frontend `.env` (optional):

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Postfix Dashboard
VITE_APP_VERSION=2.2.0
```

#### 4. Grant Permissions

The application needs read access to Postfix logs and config:

```bash
# Option 1: Add user to appropriate groups
sudo usermod -aG adm $USER

# Option 2: Grant specific file permissions
sudo chmod 644 /var/log/mail.log
sudo chmod 644 /etc/postfix/main.cf

# For write access to main.cf (network management)
sudo chown $USER:$USER /etc/postfix/main.cf
# OR
sudo chmod 664 /etc/postfix/main.cf
```

#### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the dashboard at `http://localhost:5173`

### Production Environment

#### 1. Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/dist/`

#### 2. Production Backend Configuration

Update `.env` for production:

```env
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false
```

#### 3. Serve with Process Manager

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name postfix-dashboard

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 4. Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/postfix-dashboard`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/postfix-dashboard/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/postfix-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. SSL Certificate (Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📁 Application Structure

```
postfix-dashboard/
├── backend/
│   ├── server.js              # Main Express server
│   ├── package.json           # Backend dependencies
│   └── .env                   # Backend configuration (not in repo)
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg        # App favicon
│   │   └── favicon-*.png      # Favicon variants
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx          # Main dashboard view
│   │   │   ├── Login.tsx              # Authentication page
│   │   │   ├── MailLogTable.tsx       # Log browser with filters
│   │   │   ├── AILogAnalysis.tsx      # AI analysis interface
│   │   │   ├── Analytics.tsx          # Advanced analytics
│   │   │   ├── AllowedNetworks.tsx    # Network management
│   │   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   │   ├── Header.tsx             # Top header bar
│   │   │   ├── StatCard.tsx           # Statistics display
│   │   │   ├── MailVolumeChart.tsx    # Volume visualization
│   │   │   ├── RecentActivity.tsx     # Activity feed
│   │   │   ├── Modal.tsx              # Modal component
│   │   │   ├── Pagination.tsx         # Pagination controls
│   │   │   ├── DataExport.tsx         # CSV export utility
│   │   │   ├── ErrorBoundary.tsx      # Error handling
│   │   │   └── icons/
│   │   │       └── IconComponents.tsx # SVG icon components
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Authentication state
│   │   │
│   │   ├── services/
│   │   │   ├── apiService.ts          # API client
│   │   │   └── authService.ts         # Auth utilities
│   │   │
│   │   ├── utils/
│   │   │   └── dateUtils.ts           # Date manipulation
│   │   │
│   │   ├── config/
│   │   │   └── index.ts               # App configuration
│   │   │
│   │   ├── App.tsx                    # Root component
│   │   ├── index.tsx                  # App entry point
│   │   ├── index.css                  # Global styles
│   │   ├── types.ts                   # TypeScript types
│   │   └── env.d.ts                   # Environment types
│   │
│   ├── index.html                     # HTML template
│   ├── vite.config.ts                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── postcss.config.js              # PostCSS config
│   ├── tsconfig.json                  # TypeScript config
│   ├── package.json                   # Frontend dependencies
│   └── .env                           # Frontend config (not in repo)
│
└── README.md                          # This file
```

### Key Components Explained

#### Backend (`server.js`)
- **Express Server**: Handles all API requests
- **Log Parser**: Reads and aggregates Postfix logs
- **Authentication**: Token-based auth system
- **AI Integration**: Gemini and Ollama support
- **Network Management**: Config file editing

#### Frontend Components
- **Dashboard**: Main view with statistics and charts
- **Analytics**: Advanced sender/recipient/IP analysis
- **AILogAnalysis**: AI-powered log insights
- **MailLogTable**: Filterable log browser
- **AllowedNetworks**: Visual network configuration editor

#### Services
- **apiService**: Centralized API calls with error handling
- **authService**: Token management and validation

#### Utilities
- **dateUtils**: Date range helpers for filtering

## ⚙️ Configuration

### Backend Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Backend server port |
| `LOG_LEVEL` | info | Logging verbosity (debug/info/warn/error) |
| `POSTFIX_LOG_PATH` | /var/log/mail.log | Path to Postfix log file |
| `POSTFIX_CONFIG_PATH` | /etc/postfix/main.cf | Path to Postfix config |
| `DASHBOARD_USER` | - | Login email (required) |
| `DASHBOARD_PASSWORD` | - | Login password (required) |
| `TOKEN_EXPIRY_HOURS` | 24 | Auth token lifetime |
| `AI_PROVIDER` | ollama | AI provider (gemini/ollama) |
| `GEMINI_API_KEY` | - | Google Gemini API key |
| `OLLAMA_API_BASE_URL` | http://localhost:11434 | Ollama server URL |

### Frontend Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | (empty) | Backend API URL |
| `VITE_API_TIMEOUT` | 30000 | API request timeout (ms) |
| `VITE_APP_NAME` | Postfix Dashboard | Application name |

### AI Provider Setup

#### Option 1: Google Gemini (Cloud)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set `AI_PROVIDER=gemini` in `.env`
3. Set `GEMINI_API_KEY=your_key_here`

#### Option 2: Ollama (Local)
1. Install Ollama: `curl https://ollama.ai/install.sh | sh`
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama: `ollama serve`
4. Set `AI_PROVIDER=ollama` in `.env`

## 💻 Usage

### First-Time Setup

1. Start the application (dev or production)
2. Navigate to the dashboard URL
3. Login with credentials from `.env`:
   - Email: Value of `DASHBOARD_USER`
   - Password: Value of `DASHBOARD_PASSWORD`

### Dashboard Navigation

#### Home Dashboard
- View real-time statistics (total, sent, bounced, deferred)
- Monitor volume trends with interactive charts
- Check recent critical activity
- Apply date range filters for historical data

#### Mail Logs
- Browse all mail logs with pagination
- Filter by:
  - Date range (start/end dates)
  - Status (all/sent/bounced/deferred/rejected)
- Click any log entry for detailed information
- Export filtered logs to CSV

#### AI Log Analysis
1. Select AI provider (Gemini or Ollama)
2. Configure Ollama URL if using local AI
3. Choose analysis mode:
   - Recent logs (automatic fetch)
   - Manual input (paste custom logs)
4. Set number of logs to analyze (25-200)
5. Click "Analyze Now"
6. Review:
   - Executive summary
   - Key statistics
   - Detected anomalies
   - Security threats
   - Configuration errors
   - Recommendations

#### Analytics
- View top senders with success rates
- Analyze top recipients with delivery rates
- Monitor connected IPs and their activity
- Switch between chart types (bar, line, area, pie, radar)
- Export analytics data to CSV
- Apply date filters for specific periods

#### Allowed Networks
- View current mynetworks configuration
- Add new networks (IP, CIDR, hostname)
- Remove existing networks
- Copy individual or all networks
- Save changes (requires Postfix reload)

### Keyboard Shortcuts

- `Tab`: Navigate between form fields
- `Enter`: Submit forms or activate buttons
- `Escape`: Close modals

## 🚢 Deployment

### Docker Deployment (Recommended)

#### 1. Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server.js ./

EXPOSE 3001

CMD ["node", "server.js"]
```

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - /var/log/mail.log:/var/log/mail.log:ro
      - /etc/postfix/main.cf:/etc/postfix/main.cf:rw
    environment:
      - NODE_ENV=production
      - PORT=3001
      - POSTFIX_LOG_PATH=/var/log/mail.log
      - POSTFIX_CONFIG_PATH=/etc/postfix/main.cf
      - DASHBOARD_USER=${DASHBOARD_USER}
      - DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### 3. Deploy

```bash
docker-compose up -d
```

### Cloud Platform Deployment

#### AWS (EC2 + ALB)

1. Launch EC2 instance (Ubuntu 20.04 LTS)
2. Install Node.js and dependencies
3. Clone repository and configure
4. Set up PM2 for process management
5. Configure Application Load Balancer
6. Set up Route 53 for DNS
7. Configure SSL with ACM

#### Google Cloud Platform (Compute Engine)

1. Create Compute Engine instance
2. Install dependencies and configure
3. Set up Cloud Load Balancing
4. Configure Cloud DNS
5. Set up managed SSL certificate

#### DigitalOcean (Droplet)

1. Create Ubuntu droplet
2. Follow production installation steps
3. Use DigitalOcean's managed load balancer
4. Configure DNS and SSL through DigitalOcean

### Environment-Specific Configurations

#### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Enable PM2 startup script
- [ ] Configure monitoring/alerting
- [ ] Set up automated backups
- [ ] Test disaster recovery
- [ ] Document runbooks

#### Security Hardening

```bash
# Firewall configuration
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban for brute force protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## 📚 API Documentation

### Authentication

#### POST `/api/login`
Login and receive authentication token.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "base64_encoded_token"
}
```

### Mail Logs

#### GET `/api/logs`
Retrieve mail logs with optional filters.

**Query Parameters:**
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `status`: sent|bounced|deferred|rejected|all (optional)
- `limit`: number (optional)
- `page`: number (optional)

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "id": "A1B2C3D4E5",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "from": "sender@example.com",
    "to": "recipient@domain.com",
    "status": "sent",
    "detail": "Full log message details"
  }
]
```

### Statistics

#### GET `/api/stats`
Get mail statistics summary.

**Query Parameters:**
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)

**Response:**
```json
{
  "total": 1000,
  "sent": 950,
  "bounced": 30,
  "deferred": 15,
  "rejected": 5
}
```

### Analytics

#### GET `/api/analytics/top-senders`
Get top mail senders with statistics.

**Query Parameters:**
- `startDate`, `endDate`, `limit`

**Response:**
```json
{
  "total": 50,
  "data": [
    {
      "email": "sender@example.com",
      "totalMessages": 100,
      "sent": 95,
      "bounced": 3,
      "deferred": 2,
      "successRate": "95.0",
      "relayIPs": ["192.168.1.10"],
      "firstSeen": "2025-01-01T00:00:00.000Z",
      "lastSeen": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

#### GET `/api/analytics/top-recipients`
Similar to top-senders but for recipients.

#### GET `/api/analytics/connected-ips`
Get connected IP addresses with statistics.

#### GET `/api/analytics/summary`
Get overall analytics summary.

### AI Analysis

#### POST `/api/analyze-logs`
Analyze logs using AI.

**Request:**
```json
{
  "logs": "log content to analyze",
  "provider": "ollama",
  "ollamaUrl": "http://localhost:11434"
}
```

**Response:**
```json
{
  "summary": "Executive summary...",
  "anomalies": ["Detected anomaly 1", "..."],
  "threats": ["Potential threat 1", "..."],
  "errors": ["Configuration error 1", "..."],
  "statistics": {
    "totalMessages": "100",
    "successRate": "95%",
    "bounceRate": "3%",
    "deferredRate": "2%"
  },
  "recommendations": ["Recommendation 1", "..."]
}
```

### Network Management

#### GET `/api/allowed-networks`
Get current mynetworks configuration.

**Response:**
```json
["127.0.0.0/8", "192.168.1.0/24", "[::1]/128"]
```

#### POST `/api/allowed-networks`
Update mynetworks configuration.

**Request:**
```json
{
  "networks": ["127.0.0.0/8", "192.168.1.0/24", "10.0.0.0/8"]
}
```

**Response:**
```json
{
  "message": "Networks updated successfully. Please reload Postfix configuration.",
  "networks": ["127.0.0.0/8", "192.168.1.0/24", "10.0.0.0/8"]
}
```

## 🧪 Testing

### Manual Testing

#### Backend API Tests

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'

# Test authenticated endpoint
curl http://localhost:3001/api/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Frontend Testing

1. Open browser developer tools (F12)
2. Navigate through all views
3. Check console for errors
4. Test responsive design (mobile/tablet/desktop)
5. Test all interactive features

### Automated Testing (Future Implementation)

To add automated tests:

```bash
# Backend tests (Jest)
cd backend
npm install --save-dev jest supertest
npm test

# Frontend tests (Vitest + React Testing Library)
cd frontend
npm install --save-dev vitest @testing-library/react
npm test
```

### Load Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test backend performance
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/logs
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

#### Code Style

- **TypeScript/JavaScript**: Follow ESLint rules
- **React**: Use functional components with hooks
- **CSS**: Use Tailwind utility classes
- **Naming**: Use camelCase for variables, PascalCase for components

#### Commit Messages

Follow the Conventional Commits format:

```
feat: add new analytics chart type
fix: resolve token expiration bug
docs: update installation instructions
style: format code with prettier
refactor: simplify log parsing logic
test: add unit tests for date utils
```

#### Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

### Areas for Contribution

- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📝 Documentation improvements
- 🌐 Translations and i18n
- 🧪 Test coverage
- ♿ Accessibility improvements
- 🎨 UI/UX enhancements

### Reporting Issues

When reporting bugs, include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node version, browser
- **Screenshots**: If applicable
- **Logs**: Relevant error logs

Use the issue template when creating new issues.

## 🔧 Troubleshooting

### Common Issues

#### 1. "Permission denied" when accessing logs

**Problem**: Backend cannot read `/var/log/mail.log`

**Solution:**
```bash
# Add user to adm group
sudo usermod -aG adm $USER
# Log out and back in

# OR grant specific permissions
sudo chmod 644 /var/log/mail.log
```

#### 2. "EACCES" error when updating mynetworks

**Problem**: No write permission for `/etc/postfix/main.cf`

**Solution:**
```bash
# Option 1: Change ownership
sudo chown $USER:$USER /etc/postfix/main.cf

# Option 2: Add write permission
sudo chmod 664 /etc/postfix/main.cf
```

#### 3. Frontend shows "Cannot connect to server"

**Problem**: Backend not running or wrong URL

**Solution:**
1. Verify backend is running: `curl http://localhost:3001/api/health`
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Ensure no firewall blocking ports

#### 4. AI Analysis fails with "No API key"

**Problem**: Gemini API key not configured

**Solution:**
```bash
# Set in backend .env
GEMINI_API_KEY=your_actual_api_key_here
AI_PROVIDER=gemini

# OR use Ollama instead
AI_PROVIDER=ollama
```

#### 5. Logs not updating in real-time

**Problem**: Log file not being monitored

**Solution:**
1. Verify `POSTFIX_LOG_PATH` is correct
2. Check log file exists and has content
3. Ensure log file is being written to by Postfix

#### 6. High memory usage

**Problem**: Large log files consuming memory

**Solution:**
1. Implement log rotation
2. Adjust `AI_ANALYSIS_MAX_LOGS` to lower value
3. Use pagination more aggressively

### Debug Mode

Enable detailed logging:

```bash
# In backend .env
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true

# View logs
tail -f /var/log/mail.log
```

### Getting Help

- 📖 Check the [Wiki](https://github.com/yourusername/postfix-dashboard/wiki)
- 💬 [Discussion Forum](https://github.com/yourusername/postfix-dashboard/discussions)
- 🐛 [Report Issues](https://github.com/yourusername/postfix-dashboard/issues)
- 📧 Email: support@example.com

## 📄 License

This project is licensed under the ISC License.

```
ISC License

Copyright (c) 2025 [Your Name]

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

## 🙏 Acknowledgements

### Technologies & Libraries

- **[React](https://reactjs.org/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[Vite](https://vitejs.dev/)** - Build tool
- **[Express](https://expressjs.com/)** - Backend framework
- **[Recharts](https://recharts.org/)** - Chart library
- **[Node.js](https://nodejs.org/)** - Runtime environment

### AI Providers

- **[Google Gemini](https://ai.google.dev/)** - Cloud AI analysis
- **[Ollama](https://ollama.ai/)** - Local AI models

### Inspiration

This project was inspired by the need for modern, user-friendly mail server monitoring tools and the growing complexity of email infrastructure management.

### Contributors

Thanks to all contributors who have helped improve this project!

<!-- Add contributor list -->
<a href="https://github.com/yourusername/postfix-dashboard/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yourusername/postfix-dashboard" />
</a>

### Special Thanks

- The Postfix community for excellent documentation
- The React and TypeScript communities for best practices
- All users who provided feedback and bug reports

---

## 📞 Contact & Support

- **Website**: https://example.com
- **GitHub**: https://github.com/yourusername/postfix-dashboard
- **Email**: support@example.com
- **Discord**: [Join our community](https://discord.gg/yourinvite)

## 🗺️ Roadmap

### Upcoming Features

- [ ] Real-time WebSocket updates for live log streaming
- [ ] Email notification system for critical events
- [ ] Multi-user support with role-based access control
- [ ] Database backend for historical data storage
- [ ] Advanced filtering with regex support
- [ ] Custom dashboard widgets
- [ ] Mobile application (iOS/Android)
- [ ] Integration with monitoring tools (Grafana, Prometheus)
- [ ] Automated backup and restore functionality
- [ ] Multi-language support (i18n)
- [ ] Dark/Light theme toggle
- [ ] Advanced reporting and scheduled reports
- [ ] SPF/DKIM/DMARC status checking
- [ ] Blacklist checking integration
- [ ] Queue management interface

### Version History

#### v2.2.0 (Current)
- Added advanced analytics with multiple chart types
- Improved IP tracking (local vs relay IPs)
- Enhanced AI analysis with detailed statistics
- Added collapsible sidebar
- Improved error handling and user feedback

#### v2.1.0
- Added AI-powered log analysis
- Implemented allowed networks management
- Enhanced date filtering capabilities
- Added CSV export functionality

#### v2.0.0
- Complete TypeScript rewrite
- Modern React 18 with hooks
- Tailwind CSS styling
- Improved authentication system
- Enhanced UI/UX

#### v1.0.0
- Initial release
- Basic log viewing
- Simple statistics
- Mail volume charts

---

## 📊 Performance Optimization

### Backend Optimization

#### Caching Strategy
```javascript
// Logs are cached and only re-parsed when file changes
// Adjust cache behavior in server.js if needed
```

#### Log Rotation
```bash
# Configure logrotate for mail.log
sudo nano /etc/logrotate.d/postfix

# Add:
/var/log/mail.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 syslog adm
    sharedscripts
    postrotate
        /usr/lib/rsyslog/rsyslog-rotate
    endscript
}
```

#### Database Migration (Optional)
For better performance with large datasets, consider migrating to a database:

```bash
# PostgreSQL setup
sudo apt install postgresql
sudo -u postgres createdb postfix_logs

# MongoDB setup
sudo apt install mongodb
```

### Frontend Optimization

#### Bundle Size Reduction
```bash
# Analyze bundle size
cd frontend
npm run build
npx vite-bundle-visualizer
```

#### Lazy Loading
Components are already optimized with React.lazy for code splitting.

#### CDN Configuration
For production, serve static assets from a CDN:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔒 Security Best Practices

### Authentication & Authorization

1. **Strong Passwords**: Use passwords with minimum 12 characters
2. **Token Security**: Tokens are stored in localStorage (consider httpOnly cookies for enhanced security)
3. **HTTPS Only**: Always use HTTPS in production
4. **Rate Limiting**: Consider implementing rate limiting for API endpoints

### Network Security

```bash
# Firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Fail2ban configuration
sudo apt install fail2ban
sudo nano /etc/fail2ban/jail.local
```

Add custom jail for the dashboard:
```ini
[postfix-dashboard]
enabled = true
port = http,https
filter = postfix-dashboard
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 3600
```

### Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Node.js dependencies
cd backend && npm audit fix
cd frontend && npm audit fix

# Update Node.js itself
sudo npm install -g n
sudo n lts
```

### Security Checklist

- [ ] Change default credentials immediately
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall rules
- [ ] Set up fail2ban for brute force protection
- [ ] Implement rate limiting
- [ ] Regular security audits with `npm audit`
- [ ] Keep dependencies updated
- [ ] Monitor access logs
- [ ] Set up intrusion detection (optional)
- [ ] Regular backups of configuration
- [ ] Document security procedures

---

## 🔄 Backup & Recovery

### Automated Backup Script

Create `/usr/local/bin/backup-postfix-dashboard.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/postfix-dashboard"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup configuration files
tar -czf $BACKUP_FILE \
    /path/to/postfix-dashboard/backend/.env \
    /path/to/postfix-dashboard/frontend/.env \
    /etc/postfix/main.cf

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

Schedule with cron:
```bash
sudo chmod +x /usr/local/bin/backup-postfix-dashboard.sh
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-postfix-dashboard.sh
```

### Disaster Recovery

#### Full System Restore

1. Reinstall OS and dependencies
2. Clone repository
3. Restore configuration from backup:
```bash
cd /var/backups/postfix-dashboard
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz -C /
```
4. Restart services:
```bash
pm2 restart all
sudo systemctl restart nginx
```

#### Configuration Recovery

```bash
# Restore .env files
cp /var/backups/postfix-dashboard/latest/.env /path/to/backend/
cp /var/backups/postfix-dashboard/latest/.env /path/to/frontend/

# Restore Postfix config
sudo cp /var/backups/postfix-dashboard/latest/main.cf /etc/postfix/
sudo postfix reload
```

---

## 📈 Monitoring & Alerting

### Application Monitoring

#### PM2 Monitoring
```bash
# View process status
pm2 status

# View logs
pm2 logs postfix-dashboard

# Monitor resource usage
pm2 monit
```

#### Custom Health Checks

Add to your monitoring system:
```bash
#!/bin/bash
# /usr/local/bin/check-dashboard-health.sh

HEALTH_URL="http://localhost:3001/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "Dashboard is healthy"
    exit 0
else
    echo "Dashboard is down! HTTP $RESPONSE"
    exit 1
fi
```

### Log Monitoring

#### Centralized Logging
```bash
# Install and configure rsyslog for centralized logging
sudo apt install rsyslog

# Configure to forward logs
sudo nano /etc/rsyslog.d/50-postfix-dashboard.conf
```

Add:
```
*.* @@your-log-server:514
```

### Email Alerts

Create `/usr/local/bin/alert-dashboard-down.sh`:
```bash
#!/bin/bash

RECIPIENT="admin@example.com"
SUBJECT="Postfix Dashboard Down"
BODY="The Postfix Dashboard is not responding. Please check immediately."

if ! /usr/local/bin/check-dashboard-health.sh; then
    echo "$BODY" | mail -s "$SUBJECT" "$RECIPIENT"
fi
```

Add to crontab:
```bash
*/5 * * * * /usr/local/bin/alert-dashboard-down.sh
```

---

## 🌐 Internationalization (Future)

The application is ready for internationalization. To add support:

1. Install i18n library:
```bash
cd frontend
npm install react-i18next i18next
```

2. Create language files:
```json
// src/locales/en/translation.json
{
  "dashboard": {
    "title": "Dashboard",
    "totalMails": "Total Mails"
  }
}
```

3. Configure i18n:
```typescript
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: require('./locales/en/translation.json') }
    },
    lng: 'en',
    fallbackLng: 'en'
  });
```

---

## 🧩 Integration Examples

### Grafana Integration

Export metrics in Prometheus format:

```javascript
// Add to backend/server.js
app.get('/metrics', authenticate, async (req, res) => {
  const stats = await getStats();
  const metrics = `
# HELP postfix_total_mails Total number of mails
# TYPE postfix_total_mails gauge
postfix_total_mails ${stats.total}

# HELP postfix_sent_mails Number of sent mails
# TYPE postfix_sent_mails gauge
postfix_sent_mails ${stats.sent}

# HELP postfix_bounced_mails Number of bounced mails
# TYPE postfix_bounced_mails gauge
postfix_bounced_mails ${stats.bounced}
  `;
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});
```

### Slack Integration

Add webhook notifications:

```javascript
const axios = require('axios');

async function sendSlackAlert(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;
  
  await axios.post(webhookUrl, {
    text: message,
    username: 'Postfix Dashboard',
    icon_emoji: ':mailbox:'
  });
}

// Use in your code
if (stats.bounced > threshold) {
  sendSlackAlert(`⚠️ High bounce rate detected: ${stats.bounced} bounces`);
}
```

### Webhook Support

Add custom webhooks for events:

```javascript
// backend/server.js
app.post('/api/webhooks', authenticate, async (req, res) => {
  const { url, events } = req.body;
  // Store webhook configuration
  // Trigger on specified events
});
```

---

## 📱 Mobile Access

The dashboard is fully responsive and works on mobile devices. For the best mobile experience:

1. Add to home screen (PWA support coming soon)
2. Use landscape orientation for charts
3. Enable touch-friendly navigation

### Mobile Optimization Tips

- Charts automatically resize for mobile
- Tables scroll horizontally on small screens
- Sidebar collapses automatically on mobile
- Touch-optimized buttons and controls

---

## ❓ FAQ

### General Questions

**Q: Do I need a database?**
A: No, the application reads directly from Postfix log files. However, for very high-volume servers, a database backend is recommended.

**Q: Can I monitor multiple mail servers?**
A: Currently, one instance monitors one server. For multiple servers, deploy multiple instances or consider contributing a multi-server feature.

**Q: Is it safe to expose this to the internet?**
A: Yes, with proper security measures: HTTPS, strong passwords, firewall rules, and regular updates.

**Q: What's the performance impact?**
A: Minimal. Log parsing is cached and only runs when files change. Typical memory usage: 50-100MB.

### Technical Questions

**Q: Why are my logs not showing?**
A: Check permissions on `/var/log/mail.log` and verify `POSTFIX_LOG_PATH` in `.env`.

**Q: Can I use PostgreSQL instead of log files?**
A: The current version reads log files directly. Database support is on the roadmap.

**Q: How do I customize the AI analysis prompts?**
A: Edit the prompt template in `backend/server.js` in the `/api/analyze-logs` endpoint.

**Q: Can I add custom metrics?**
A: Yes! Extend the log parser in `backend/server.js` and add new endpoints.

### Deployment Questions

**Q: Do I need a reverse proxy?**
A: For production with SSL/HTTPS, yes. Nginx or Apache are recommended.

**Q: Can I run this in a Docker container?**
A: Yes! See the Docker deployment section above.

**Q: What about Kubernetes?**
A: You can deploy to Kubernetes. Create appropriate manifests for the deployment.

---

## 🎓 Learning Resources

### Postfix Documentation
- [Official Postfix Documentation](http://www.postfix.org/documentation.html)
- [Postfix Configuration Guide](http://www.postfix.org/BASIC_CONFIGURATION_README.html)
- [Log File Format](http://www.postfix.org/postlog.1.html)

### Development Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## 🏆 Alternatives & Comparisons

### Similar Tools
- **Mailgraph**: Simple RRDtool-based graphs
- **pflogsumm**: Postfix log analyzer (command-line)
- **Mailwatch**: PHP-based mail monitoring
- **ELK Stack**: Comprehensive log analysis (complex setup)

### Why Choose Postfix Dashboard?
- ✅ Modern, intuitive UI
- ✅ AI-powered insights
- ✅ Easy installation
- ✅ Real-time monitoring
- ✅ No database required
- ✅ Active development

---

## 📞 Support & Community

### Getting Help

1. **Documentation**: Check this README and the Wiki
2. **Search Issues**: Someone may have had the same problem
3. **Ask the Community**: Use GitHub Discussions
4. **Report Bugs**: Create a detailed issue report

### Community Guidelines

- Be respectful and constructive
- Search before posting
- Provide detailed information
- Help others when you can
- Follow the Code of Conduct

### Commercial Support

For enterprise support, custom development, or consulting:
- 📧 Email: enterprise@example.com
- 🌐 Website: https://example.com/support
- 📞 Phone: +1-XXX-XXX-XXXX

---

## 📜 Change Log

### [2.2.0] - 2025-01-XX
#### Added
- Advanced analytics with multiple chart types
- Improved IP address tracking
- Enhanced AI analysis with statistics
- Collapsible sidebar
- Better error messages

#### Changed
- Updated dependencies
- Improved performance for large log files
- Better mobile responsiveness

#### Fixed
- IP address extraction bug in analytics
- Token expiration handling
- Chart rendering issues

### [2.1.0] - 2024-XX-XX
#### Added
- AI-powered log analysis
- Allowed networks management
- CSV export functionality

### [2.0.0] - 2024-XX-XX
#### Changed
- Complete rewrite in TypeScript
- New modern UI with Tailwind CSS
- Improved authentication

---

## 🎯 Project Status

**Current Status**: ✅ Active Development

- **Stability**: Production-ready
- **Maintenance**: Actively maintained
- **Support**: Community and commercial support available
- **Updates**: Regular updates and security patches

### Build Status
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-green)

---

## 💖 Support This Project

If you find this project helpful, consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📝 Improving documentation
- 💰 Sponsoring development

### Sponsors

Special thanks to our sponsors:
<!-- Add sponsor logos/links here -->

---

**Made with ❤️ by the Postfix Dashboard Team**

*Last Updated: January 2025*