const express = require("express");
const bodyParser = require("body-parser");
const GenEpub = require("./methods/GenEpub.js");
const GenMobi = require("./methods/GenMobi");
const mangaLivreHandler = require("./methods/MangaLivreApiHandler");
const got = require("axios");
const path = require("path");
const userSchema = require("./schemes/user");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require("dotenv").config();
const apiKeyAuth = require("./middlewares/apikeyAuth")
const { v4: uuidv4 } = require('uuid');
const mongoose = require("mongoose");
const AesEncryption = require('aes-encryption')
const GetMangaImages = require("./methods/GetMangaImages.js")
var cors = require("cors");

const User = mongoose.model('usuarios', userSchema);

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

mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY)

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

app.get("/api/mangas/search/:name", async (req, res) => {
  var return_data = { "mangas": [] };
  
  await got.post(
    "https://mangalivre.net/lib/search/series.json", { search: req.params.name }, {
    headers: {
      "x-requested-with": "XMLHttpRequest",
      "content-type": "application/x-www-form-urlencoded",
    },
  }).then((res) => {
    // nenhum resultado

    console.log(res.data.series)
    if (!res.data.series) {
      return return_data;
    }

    for (let serie of res.data.series) {
      return_data.mangas.push({
        "id_serie": serie.id_serie,
        "name": serie.name,
        "label": serie.label,
        "score": serie.score,
        "value": serie.value,
        "author": serie.author,
        "artist": serie.artist,
        "image": serie.cover,
        "categories": serie.categories.map((categorie) => { return { "name": categorie.name, "id_category": categorie.id_category }; }),
      });
    }
  });

  res.send(return_data);
})

app.get("/api/mangas/search2/:name", async (req, res) => {
  const url = `https://api.consumet.org/manga/mangadex/${req.params.name}`;

  const { data } = await got.get(url);

  res.send(data);
})

app.post("/api/mangas/generate-volume", apiKeyAuth, async (req, res) => {
  let totalImages = [];
  let PathToEpub = path.join(require("os").homedir(), "Pictures", req.body.folder);

  totalImages = [...await GetMangaImages(req.body.name, req.body.folder, req.body.start, req.body.end)];

  await GenEpub(totalImages,
    req.body.folder,
    req.body.author,
    PathToEpub,
    req.body.cover
  );

  await GenMobi(path.join(PathToEpub, `${req.body.folder}.epub`), req.body.folder).then(() => { res.send("teste"); });
});

app.post("/api/users/signup", async (req, res) => {
  const user = new User({
    name: req.body.Name,
    username: req.body.Username,
    email: req.body.Email,
    password: aes.encrypt(req.body.Password),
    apikey: uuidv4(),
    passwordChangeCode: null
  });

  user.save()
    .then(
      () => console.log(),
      (err) => console.log(err)
    );

  res.send({
    Name: req.body.Name,
    Username: req.body.Username,
    Email: req.body.Email
  })
})

app.get("/download", async (req, res) => {
  res.set({
    'Content-Disposition': 'attachment; filename=nome-do-arquivo.epub'
  });

  res.download(`C:/Users/jbdes/Pictures/teste/teste.epub`);
})

app.post("/api/users/signin", async (req, res) => {
  const loggedUser = await User.findOne({
    username: req.body.Username,
    password: aes.encrypt(req.body.Password)
  }).exec();

  console.log(loggedUser)

  if (loggedUser == null) {
    return res.status(401).send();
  }

  res.send(loggedUser.apikey);
})

app.get('/', (req, res) => {
  res.redirect("/swagger")
});


app.listen(port, () => { });