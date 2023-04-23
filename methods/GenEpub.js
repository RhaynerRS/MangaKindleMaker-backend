const fs = require("fs");
const path = require("path");
const Epub = require("epub-gen");
const JSZip = require("jszip");
const {Blob} = require("buffer")
const xml2js = require("xml2js");
// Obter o caminho completo para a pasta de imagens e o arquivo de saída
async function GenEpub(totalImages,titulo, autor, diretorio, urlCover) {

  const outputFile = `${titulo}.epub`;
  const imagesFolderPath = path.resolve(diretorio);
  const outputFolderPath = path.resolve(diretorio);
  const outputPath = path.join(outputFolderPath, outputFile);

  // Obter a lista de arquivos na pasta de imagens
  const imageFiles = fs
    .readdirSync(imagesFolderPath)
    .filter(
      (file) =>
        file.toLowerCase().endsWith(".jpg") ||
        file.toLowerCase().endsWith(".jpeg") ||
        file.toLowerCase().endsWith(".png")
    );

  // Converter cada arquivo em um objeto de capítulo
  const chapters = totalImages.map((imageUrl) => {
    return {
      data: `<div style="text-align:center;top:0.0%;">
      <img width="1072" height="1448" src="${imageUrl}"/>
      </div>
      `,
    };
  });

  // Gerar o arquivo EPUB
  const options = {
    title: titulo.replace("-"," "),
    author: autor,
    publisher: "panini",
    language: "pt-br",
    cover: urlCover,
    output: outputPath,
    content: chapters,
    css: `@page {
        margin: 0;
        }
        body {
        display: block;
        margin: 0;
        padding: 0;
        }
        #PV {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        }
        #PV-T {
        top: 0;
        width: 100%;
        height: 50%;
        }
        #PV-B {
        bottom: 0;
        width: 100%;
        height: 50%;
        }
        #PV-L {
        left: 0;
        width: 49.5%;
        height: 100%;
        float: left;
        }
        #PV-R {
        right: 0;
        width: 49.5%;
        height: 100%;
        float: right;
        }
        #PV-TL {
        top: 0;
        left: 0;
        width: 49.5%;
        height: 50%;
        float: left;
        }
        #PV-TR {
        top: 0;
        right: 0;
        width: 49.5%;
        height: 50%;
        float: right;
        }
        #PV-BL {
        bottom: 0;
        left: 0;
        width: 49.5%;
        height: 50%;
        float: left;
        }
        #PV-BR {
        bottom: 0;
        right: 0;
        width: 49.5%;
        height: 50%;
        float: right;
        }
        .PV-P {
        width: 100%;
        height: 100%;
        top: 0;
        position: absolute;
        display: none;
        }
        
    `,
    size: {
      width: 1072,
      height: 1448,
    },
    margin: "0 0 0 0",
    tocTitle: "",
  };

  await new Epub(options).promise.then(() => {
      
    })
    .catch((err) => console.error("Erro ao gerar o arquivo EPUB:", err));

      const epubFile = fs.readFileSync(outputPath);
      const zip = await JSZip.loadAsync(epubFile);

      // Extrai o arquivo content.opf
      const contentOpfFile = await zip.file('OEBPS/content.opf').async('string');

      // Adiciona metadados ao arquivo content.opf
      const metadata = `
      <meta name="fixed-layout" content="true"/>
      <meta name="original-resolution" content="1072x1448"/>
      <meta name="book-type" content="comic"/>
      <meta name="primary-writing-mode" content="horizontal-rl"/>
      <meta name="zero-gutter" content="true"/>
      <meta name="zero-margin" content="true"/>
      <meta name="ke-border-color" content="#FFFFFF"/>
      <meta name="ke-border-width" content="0"/>
      <meta name="orientation-lock" content="portrait"/>
      <meta name="region-mag" content="true"/>

      `;
      const updatedContentOpfFile = contentOpfFile.replace('</metadata>', metadata + '</metadata>');

      // Cria um novo arquivo EPUB com o arquivo content.opf atualizado
      zip.file('OEBPS/content.opf', updatedContentOpfFile);
      const updatedEpubFile = await zip.generateAsync({ type: 'nodebuffer' });

      // Salva o novo arquivo EPUB
      fs.writeFileSync(path.join(outputPath), updatedEpubFile);
}


module.exports = GenEpub;