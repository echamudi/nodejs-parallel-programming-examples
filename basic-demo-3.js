const { spawn } = require('child_process');
const mpiexec = spawn('mpiexec', ['--display-map', '--bind-to', 'core', 'node', 'basic-demo-2.js']);

mpiexec.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

mpiexec.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

mpiexec.on('close', (code) => {
  console.log(`mpiexec exited with code ${code}`);
});
