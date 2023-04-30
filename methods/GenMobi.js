const { execFile } = require('child_process');
const path = require('path');

async function GenMobi(PathToEpub, NomeArquivo) {
  const kindlegenPath = path.join(__dirname, 'kindlegen.exe');
  const args = [PathToEpub, '-o', `${NomeArquivo}.mobi`];
  
  execFile(kindlegenPath, args, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

module.exports = GenMobi;