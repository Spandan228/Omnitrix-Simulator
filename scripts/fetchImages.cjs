const fs = require('fs');
const https = require('https');
const path = require('path');

const aliens = [
    { id: 1, query: 'Heatblast_(Classic)' },
    { id: 2, query: 'Wildmutt_(Classic)' },
    { id: 3, query: 'Diamondhead_(Classic)' },
    { id: 4, query: 'XLR8_(Classic)' },
    { id: 5, query: 'Grey_Matter_(Classic)' },
    { id: 6, query: 'Four_Arms_(Classic)' },
    { id: 7, query: 'Stinkfly_(Classic)' },
    { id: 8, query: 'Ripjaws_(Classic)' },
    { id: 9, query: 'Upgrade_(Classic)' },
    { id: 10, query: 'Ghostfreak_(Classic)' },
    { id: 11, query: 'Cannonbolt_(Classic)' },
    { id: 12, query: 'Wildvine_(Classic)' },
    { id: 13, query: 'Blitzwolfer_(Classic)' },
    { id: 14, query: 'Snare-oh_(Classic)' },
    { id: 15, query: 'Frankenstrike_(Classic)' },
    { id: 16, query: 'Ditto_(Classic)' },
    { id: 17, query: 'Eye_Guy_(Classic)' },
    { id: 18, query: 'Way_Big_(Classic)' },
    { id: 19, query: 'Upchuck_(Classic)' },
    { id: 20, query: 'Arctiguana_(Classic)' }
];

async function fetchImage(alien) {
    const url = `https://ben10.fandom.com/api.php?action=query&prop=pageimages&titles=${alien.query}&format=json&pithumbsize=500`;

    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId !== "-1" && pages[pageId].thumbnail) {
                        const imageUrl = pages[pageId].thumbnail.source;
                        downloadImage(imageUrl, alien.id).then(resolve);
                    } else {
                        console.log(`No image for ${alien.query}, trying without (Classic)`);
                        const fallbackUrl = `https://ben10.fandom.com/api.php?action=query&prop=pageimages&titles=${alien.query.replace('_(Classic)', '')}&format=json&pithumbsize=500`;
                        https.get(fallbackUrl, (res2) => {
                            let data2 = '';
                            res2.on('data', chunk => data2 += chunk);
                            res2.on('end', () => {
                                const json2 = JSON.parse(data2);
                                const pages2 = json2.query.pages;
                                const pageId2 = Object.keys(pages2)[0];
                                if (pageId2 !== "-1" && pages2[pageId2].thumbnail) {
                                    downloadImage(pages2[pageId2].thumbnail.source, alien.id).then(resolve);
                                } else {
                                    console.log(`Still no image for ${alien.query}`);
                                    resolve();
                                }
                            });
                        });
                    }
                } catch (e) {
                    console.log(`Failed parsing for ${alien.query}`);
                    resolve();
                }
            });
        }).on('error', resolve);
    });
}

function downloadImage(url, id) {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(path.join(__dirname, 'public', 'aliens', `${id}.png`));
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${id}.png`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(path.join(__dirname, 'public', 'aliens', `${id}.png`), () => { });
            console.log(`Error downloading ${id}.png: ${err.message}`);
            resolve();
        });
    });
}

async function run() {
    for (const alien of aliens) {
        await fetchImage(alien);
    }
}

run();
