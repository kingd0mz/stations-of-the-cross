const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
// Compatibility alias: normal previews now include the authorized English text.
const cli = require.resolve('expo/bin/cli');
const child = spawn(process.execPath, [cli, 'start', '--go', '--clear', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
