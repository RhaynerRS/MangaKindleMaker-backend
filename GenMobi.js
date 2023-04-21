const { exec } = require('child_process');
const path = require("path");

async function GenMobi(PathToEpub, NomeArquivo) {
    exec(`cd ${path.join(__dirname)} & kindlegen.exe ${PathToEpub} -o ${NomeArquivo}.mobi`, () => {});
}

module.exports = GenMobi;