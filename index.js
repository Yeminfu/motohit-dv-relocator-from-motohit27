import puppeteer from 'puppeteer';
import getLinksFromSidebar from './tools/getLinksFromSidebar.js';
import getDataFromCategoryPage from './tools/getDataFromCategoryPage.js';
import defaultLinks from './db/defaultLinks.json.js';
import getDataFromProductPage from './tools/getDataFromProductPage.js';

import createProductInDB from './tools/createProductInDB.js';
import db_connection from './tools/dbConnect.js';

import imageWorker from './tools/imageWorker.js';
import attributesWorker from './tools/attributesWorker.js';


let defaultLinksIsOn = false;
console.log('go go go!');


(async () => {

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'], });
    const page = await browser.newPage();


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
        const { products, ...asd } = await getDataFromCategoryPage(page, link);
        if (!products) continue;
        productsLinks.push(...products);
    }

    for (let index = 0; index < productsLinks.length; index++) {
        const { link, category_name } = productsLinks[index];

        const categoryId = await (async () => {
            const category = await new Promise(r => db_connection.query(`SELECT * FROM categories WHERE category_name="${category_name}"`, function (err, data) {
                if (!data) r(null);
                if (!data[0]) r(null)
                r(data[0].id);
            }));
            return category;
        })();

        console.log(`product ${index} from ${productsLinks.length - 1}`);

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

        if (attributes?.length) {
            console.log('начали работать с атрибутами');
            for (let index = 0; index < attributes.length; index++) {
                const { attribute, value } = attributes[index];

                await attributesWorker(
                    attribute,
                    value,
                    categoryId,
                    productId
                );
            }
            console.log('закончили работать с атрибутами');
        }

        if (youtubeLink) {
            console.log('начали работать с youtubeLink', youtubeLink);
            await new Promise(r => {
                const qs = `INSERT INTO media (type, name, essense_id) VALUES ("product_video", "${youtubeLink}", "${productId}")`;
                // console.log('qs', );
                db_connection.query(
                    qs,
                    function (err, res) {
                        if (err) { console.log('err #c83u2iok'); }
                        console.log(res);
                        r()
                    }
                )
            })
            console.log('закончили работать с youtubeLink', youtubeLink);
        }
    }

    await browser.close();
    await db_connection.close();

})();