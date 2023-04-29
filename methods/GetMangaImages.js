const { MANGA } = require("@consumet/extensions");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function GetMangaVolumePages(mangaId, userImageFolderPath, volume = 1) {
    const images = [];
    let chapters = [];

    fs.mkdir(userImageFolderPath, { recursive: true }, (err) => {
        if (err) {
            throw err;
        }
    });
    const mangadex = new MANGA.MangaDex({ languages: "pt-br" });

    const mangaData = await mangadex.fetchMangaInfo(mangaId);

    chapters = mangaData.chapters.filter(
        (chapter) => parseInt(chapter.volumeNumber) == volume
    );

    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const pages = await mangadex.fetchChapterPages(chapter.id);
        for (let j = 0; j < pages.length; j++) {
            const page = pages[j];
            await axios({
                    url: page.img,
                    responseType: "stream",
                }).then(async (response) => {
                    await response.data.pipe(fs.createWriteStream(`${userImageFolderPath}/${images.length + 1}.png`));
                    images.push(`${images.length + 1}.png`)
                });
        }
    }

    return images;
}

module.exports = GetMangaVolumePages;
