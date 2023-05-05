const compress_images = require("compress-images");
const path = require("path");

async function ComprimeImagens(pathImages){
    await compress_images(`${pathImages}/**/**.png`, pathImages, {compress_force: true, statistic: false, autoupdate: true}, false,
        {jpg: {engine: false, command: false}},
        {png: {engine: 'pngquant', command: ['--quality=20-50', '--ext=.png',  '--force']}},
        {svg: {engine: false, command: false}},
        {gif: {engine: false, command: false}}, function(){
            return true;
        });
}

module.exports = ComprimeImagens;
