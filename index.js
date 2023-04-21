const express = require("express");
const bodyParser = require("body-parser");
const GenEpub = require("./GenEpub.js");
const GenMobi = require("./GenMobi.js");
const path = require("path");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
//const swaggerDocument = require('./swagger.json');
const GetMangaImages = require("./GetMangaImages.js")
var cors = require("cors");

const options = {
  failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MangaKindleMaker',
      version: '1.0.0',
    },
  },
  apis: ['./routes.js'],
};


const swaggerSpec = swaggerJsdoc(options);

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.set("views", "./static/");
app.use(express.static("./public/"))
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

let port = 3000;

app.post("/api/mangas/generate-volume", async (req, res) => {
  let totalImages = [];
  let PathToEpub = path.join(require("os").homedir(), "Pictures",  req.body.folder);

  totalImages = [...await GetMangaImages(req.body.name, req.body.folder, req.body.start, req.body.end)];
  
  await GenEpub(totalImages,
    req.body.folder,
    req.body.author,
    PathToEpub,
    req.body.cover
  );
  
  await GenMobi(path.join(PathToEpub, `${req.body.folder}.epub`), req.body.folder);

  res.send(`Seu mangá ${req.body.name} foi gerado com sucesso e foi salvo em ${PathToEpub}`);
});

app.get('/', (req, res) => {
  res.redirect("/swagger")
});

app.get('*', (req, res) => {
  res.header("404");
  res.render("errors/404.html");
});

app.listen(port, () => {});