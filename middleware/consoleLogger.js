// Helper function to get current timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Helper function to extract token from Authorization header
const extractToken = (authHeader) => {
  if (!authHeader) return 'No Token';
  
  // Extract token from "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    const token = parts[1];
    // Show first and last 6 characters of token for identification while hiding the middle
    if (token.length > 12) {
      return `${token.substring(0, 6)}...${token.substring(token.length - 6)}`;
    }
    return token;
  }
  return 'Invalid Format';
};

// Helper function to get client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         req.ip ||
         'Unknown';
};

// Console logger middleware
const consoleLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Color codes for terminal
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  };
  
  // Method color mapping
  const methodColors = {
    GET: colors.green,
    POST: colors.yellow,
    PUT: colors.blue,
    DELETE: colors.red,
    PATCH: colors.magenta
  };
  
  const methodColor = methodColors[req.method] || colors.white;
  
  // Print request info
  console.log(`${colors.cyan}[${getTimestamp()}]${colors.reset} ${methodColor}${req.method}${colors.reset} ${req.originalUrl}`);
  console.log(`├─ ${colors.bright}Token:${colors.reset} ${extractToken(req.headers.authorization)}`);
  console.log(`├─ ${colors.bright}IP:${colors.reset} ${getClientIp(req)}`);
  
  // Print body for non-GET requests (truncated)
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    const bodyStr = JSON.stringify(req.body);
    const truncatedBody = bodyStr.length > 100 ? bodyStr.substring(0, 100) + '...' : bodyStr;
    console.log(`├─ ${colors.bright}Body:${colors.reset} ${truncatedBody}`);
  }
  
  // Handle query params
  if (Object.keys(req.query).length > 0) {
    console.log(`├─ ${colors.bright}Query:${colors.reset} ${JSON.stringify(req.query)}`);
  }
  
  // Capture response
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    logResponse();
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    logResponse();
    return originalJson.call(this, data);
  };
  
  function logResponse() {
    const duration = Date.now() - startTime;
    
    // Status color coding
    let statusColor = colors.green;
    if (res.statusCode >= 400) statusColor = colors.red;
    else if (res.statusCode >= 300) statusColor = colors.yellow;
    
    console.log(`└─ ${statusColor}${res.statusCode}${colors.reset} (${duration}ms)`);
    
    // If user info is available from auth middleware, print it
    if (req.user) {
      console.log(`   ${colors.dim}User: ${req.user.username || req.user.email || req.user.id || 'Unknown'}${colors.reset}`);
    }
    
    console.log(''); // Empty line for separation
  }
  
  next();
};

module.exports = consoleLogger; 