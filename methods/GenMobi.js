const { spawn } = require('child_process');
const path = require('path');

async function genMobi(epubPath, filename) {
  const kindlegenPath = path.join(__dirname, 'kindlegen.exe');
  const args = [epubPath, '-o', `${filename}.mobi`];

  const kindlegen = spawn(kindlegenPath, args);

  kindlegen.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  kindlegen.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  return new Promise((resolve, reject) => {
    kindlegen.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Kindlegen exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

module.exports = genMobi;