import puppeteer from 'puppeteer';
import getLinksFromSidebar from './tools/getLinksFromSidebar.js';
import getDataFromCategoryPage from './tools/getDataFromCategoryPage.js';
// import defaultLinks from './db/defaultLinks.json.js';
import categories from './db/categoriesPage.json.js';
import getDataFromProductPage from './tools/getDataFromProductPage.js';

import createProductInDB from './tools/createProductInDB.js';
import db_connection, { pool } from './tools/dbConnect.js';

import imageWorker from './tools/imageWorker.js';
import attributesWorker from './tools/attributesWorker.js';
import clearProducts from './tools/clearProducts.js';

console.log('go go go!');

(async () => {
    clearProducts();

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'], });
    const page = await browser.newPage();

    for (let index = 0; index < categories.length; index++) {
        const { href, is_first } = categories[index];
        const { category_name, products, video } = await getDataFromCategoryPage(page, href);

        const category_id = await new Promise(resolve => {
            pool.query(
                "SELECT * FROM categories WHERE category_name = ?",
                [category_name],
                function (err, res) {
                    resolve(res.pop().id);
                }
            )
        });

        if (video?.length && is_first) {
            for (let index = 0; index < video.length; index++) {
                const videoLink = video[index];
                await new Promise(resolve => {
                    pool.query(
                        "INSERT into media (type, name, essense_id) VALUES (?,?,?)",
                        ["category_video", videoLink, category_id],
                        function (err, res) {
                            resolve(1);
                        }
                    )
                })
            }
        }

        if (products?.length) {
            await productWorker(href, category_name, page);
        }

    }

    await browser.close();
    await db_connection.close();

})();


async function productWorker(link, category_name, page) {

    const categoryId = await (async () => {
        const category = await new Promise(r => pool.query(
            `SELECT * FROM categories WHERE category_name=?`,
            [category_name],
            function (err, data) {
                if (!data) r(null);
                if (!data[0]) r(null);
                r(data[0].id);
            }));
        return category;
    })();

    console.log('productLink', link);



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
            pool.query(
                `INSERT INTO media (type, name, essense_id) VALUES (?, ?, ?)`,
                ['product_video', youtubeLink, productId],
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