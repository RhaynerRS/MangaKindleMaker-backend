var {spawn} = require('child_process')
const path = require("path");

async function GenMobi(PathToEpub, NomeArquivo) {
    const kindleGen = spawn('kindlegen.exe', [PathToEpub, '-o', `${NomeArquivo}.mobi`], { cwd: __dirname });

    kindleGen.on('error', (err) => {
      console.error(`Erro ao executar o comando kindlegen.exe: ${err}`);
    });
  
    kindleGen.on('close', (code) => {
      if (code === 0) {
        console.log('O processo filho foi concluído com sucesso!');
      } else {
        console.error(`O processo filho foi encerrado com o código de saída ${code}`);
      }
    });
}

module.exports = GenMobi;