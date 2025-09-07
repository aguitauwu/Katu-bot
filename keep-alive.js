const http = require('http');

// Keep-alive script for Replit to maintain 24/7 uptime
const keepAlive = () => {
  const url = process.env.REPL_SLUG 
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/health`
    : 'http://localhost:5000/health';

  const pingServer = () => {
    http.get(url, (res) => {
      console.log(`🔄 Keep-alive ping: ${res.statusCode} - ${new Date().toISOString()}`);
    }).on('error', (err) => {
      console.error('❌ Keep-alive error:', err.message);
    });
  };

  // Ping every 5 minutes (300000 ms)
  setInterval(pingServer, 5 * 60 * 1000);
  
  // Initial ping
  setTimeout(pingServer, 1000);
  
  console.log('🟢 Keep-alive service started - Pinging every 5 minutes');
};

module.exports = keepAlive;

// Auto-start if running directly
if (require.main === module) {
  keepAlive();
}
