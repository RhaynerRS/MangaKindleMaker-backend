const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mangaLivreHandler = require("./MangaLivreApiHandler");

async function GetMangaImages(manga, nomePasta, inicio = 1, fim = 1) {
    let chaptersId = [];
    let images = [];
    let mangaId = "";
    let itemsProcessed = 0;
    let userImageFolderPath = path.join(
        require("os").homedir(),
        "Pictures",
        nomePasta
    );
    console.log(manga);
    var return_data = {
        id_serie: undefined,
        url_name: undefined,
        name: undefined,
        chapters: [],
    };

    //create folder to downloaded chapters
    fs.mkdir(userImageFolderPath, { recursive: true }, (err) => {
        if (err) {
            throw err;
        }
    });

    //search manga by name
    await mangaLivreHandler.search(manga).then(async (res) => {
        console.log(res)
        mangaId = res.mangas[0].id_serie;
    });

    //get chapters from volume
    for (let i = 1; ; i++) {
        var result = await mangaLivreHandler.getChapters(mangaId, i);

        if (result.chapters.length > 0) {
            for(let chapter of result.chapters.reverse()) {
                let chapter_number = parseInt(chapter.number);
                if (chapter_number >= inicio && chapter_number <= fim)
                    chaptersId.push(chapter.id_release);
            };
            continue;
        }
        break;
    }

    //get pages from chapters
    for(const chapter of chaptersId){
        await mangaLivreHandler.getPages(chapter).then(async (pages) => {
            for(let image of pages.images){
                images.push(image.legacy)
            }
        });
    }

    return images;
}

module.exports = GetMangaImages;
