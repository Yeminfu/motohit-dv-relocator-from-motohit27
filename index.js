import puppeteer from 'puppeteer';
import getLinksFromSidebar from './tools/getLinksFromSidebar.js';
import getDataFromCategoryPage from './tools/getDataFromCategoryPage.js';
import defaultLinks from './db/defaultLinks.json.js';
import getDataFromProductPage from './tools/getDataFromProductPage.js';

import createProductInDB from './tools/createProductInDB.js';
import db_connection from './tools/dbConnect.js';

import fs from "fs";
import request from "request";


let defaultLinksIsOn = false;
console.log('go go go!');


(async () => {

    await db_connection;

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'], });
    const page = await browser.newPage();

    await (async () => {
        const category_name = "Электросамокаты";
        const link = "https://мотохит27.рф/product/моторная-лодка-пвх-roger-boat-4000-киль-большой";
        const {
            youtubeLink,
            attributes,
            imagesLinks,
            ...dataFromProductPage
        } = await getDataFromProductPage(link, page);

        const productId = await createProductInDB(category_name, dataFromProductPage, page)

        if (imagesLinks?.length) {
            for (let index = 0; index < imagesLinks.length; index++) {
                const link = imagesLinks[index];
                await imageWorker(link, productId);

            }
        }

        console.log({
            productId,
            youtubeLink,
            attributes,
            // imagesLinks
        });
        await browser.close();
        await db_connection.close();
    })();

    return;


    let links;

    if (defaultLinksIsOn) {
        console.log('нахуй главную');
        links = defaultLinks;
    } else {
        console.log('открываем главную');
        await page.goto('https://мотохит27.рф');
        links = await getLinksFromSidebar(page);
    }

    const productsLinks = [];
    for (let index = 0; index < links.length; index++) {
        const link = links[index];
        console.log(`category ${index} from ${links.length - 1}`);
        // console.log('link', link);
        const { products, ...asd } = await getDataFromCategoryPage(page, link);
        // console.log({ products, asd });
        if (!products) continue;
        productsLinks.push(...products);
    }

    for (let index = 0; index < productsLinks.length; index++) {
        const { link, product_name, category_name } = productsLinks[index];
        // console.log({ link, product_name, category_name });
        console.log(`product ${index} from ${productsLinks.length - 1}`);
        const dataFromProductPage = await getDataFromProductPage(link, page);


        createProductInDB(category_name, dataFromProductPage, page)

        // console.log('dataFromProductPage', dataFromProductPage);
    }

    await browser.close();
    await db_connection();

})();



async function imageWorker(link, productId) {
    const imageName = link.split("/").pop();

    const imageDownloaded = await imageLoader(link, imageName);
    if (imageDownloaded) {
        await new Promise(r => {
            db_connection.query(
                `INSERT INTO media (type, name, essense_id) VALUES ("product_image", "${imageName}", ${productId} )`,
                function (err) {
                    if (err) {
                        console.log('insert Image To DB error', err);
                    } else {
                        console.log('image saved');
                    }
                    r();
                }
            )
        });
    } else {
        console.log('no image');
    }
}

async function imageLoader(uri, filename) {
    return await new Promise(
        r =>
            request.head(uri, function (err, res, body) {
                if (res.headers['content-length']) {
                    const filePath = `${process.env.IMAGES_FOLDER}/${filename};`
                    request(uri).pipe(fs.createWriteStream(filePath)).on('close', () => null);
                    r(true);
                } else {
                    r(false);
                    console.log('no image');
                }

            })
    )
};