const express = require("express");
const bodyParser = require("body-parser");
const GenEpub = require("./methods/GenEpub.js");
const GenMobi = require("./methods/GenMobi");
const fs = require("fs");
const path = require("path");
const userSchema = require("./schemes/user");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require("dotenv").config();
const apiKeyAuth = require("./middlewares/apikeyAuth")
const { v4: uuidv4 } = require('uuid');
const mongoose = require("mongoose");
const AesEncryption = require('aes-encryption')
const GetMangaVolumePages= require("./methods/GetMangaImages.js")
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

app.post("/api/mangas/generate-volume", apiKeyAuth, async (req, res) => {
  let totalImages = [];
  let uuid = uuidv4();
  let PathToEpub = path.join(__dirname, uuid);
  totalImages = [...await GetMangaVolumePages(req.body.id, PathToEpub, req.body.volume)];

  await GenEpub(totalImages,
    uuid,
    req.body.author,
    PathToEpub,
    req.body.cover
  );

  await GenMobi(path.join(PathToEpub, `${uuid}.epub`), uuid)

  setTimeout(async ()=>{
    fs.rmdir(PathToEpub, { recursive: true }, err => {
      if (err) {
        throw err
      }
    })
  },300000)

  res.send(uuid);
});

app.post("/api/users/signup", async (req, res) => {
  const user = new User({
    name: req.body.Name,
    username: req.body.Username,
    email: req.body.Email,
    password: req.body.Password,
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

app.get("/api/mangas/download/:id", async (req, res) => {
  res.set({
    'Content-Disposition': `attachment; filename=${req.params.id}.epub`
  });

  res.download(path.join(__dirname, `${req.params.id}/${req.params.id}.epub`));
})

app.post("/api/users/signin", async (req, res) => {
  const loggedUser = await User.findOne({
    username: req.body.Username,
    password: req.body.Password
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