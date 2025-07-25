const { spawn } = require('child_process');
function lanzarMCP() {
  const mcp = spawn('npx', ['-y', '@playwright/mcp@latest']);
  mcp.stdout.on('data', data => console.log('[MCP]', data.toString()));
  mcp.stderr.on('data', data => console.error('[MCP ERROR]', data.toString()));
  return mcp;
}
function enviarAccion(mcp, accion) {
  mcp.stdin.write(JSON.stringify(accion) + '\n');
}
module.exports = { lanzarMCP, enviarAccion };
