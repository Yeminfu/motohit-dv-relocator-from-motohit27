import getDataFromCategoryPage from './tools/getDataFromCategoryPage.js';
import categories from './db/categoriesPage.json.js';
import getDataFromProductPage from './tools/getDataFromProductPage.js';

import createProductInDB from './tools/createProductInDB.js';
import db_connection, { pool } from './tools/dbConnect.js';

import imageWorker from './tools/imageWorker.js';
import attributesWorker from './tools/attributesWorker.js';
import clearProducts from './tools/clearProducts.js';
import fs from "fs"

console.log('go go go!');

(async () => {
    await clearProducts();

    // const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'], });
    // const page = await browser.newPage();


    const products = JSON.parse(fs.readFileSync("./db/allProducts.json", "utf-8", () => null));
    // console.log('products', products[0]);
    // const products = await fetch("http://мотохит27.рф/wp-json/v1/products")
    //     .then(x => x.json());

    // fs.writeFile("./db/allProducts.json", JSON.stringify(products), () => null);

    // return;
    const stockStatuses = {
        "instock": "в наличии в магазине",
        "isenroute": "в наличии на складе",
        "onbackorder": "под заказ",
        "outofstock": "нет в наличии"
    };

    for (let index = 0; index < products.length; index++) {
        const product = products[index];
        const { price, name, stock_status, attributes, description, images, video, category } = product;

        const productId = await createProductInDB(category, {
            description,
            stockStatusText: stockStatuses[stock_status],
            product_name: name,
            price,
        }
            // , page
        );

        if (!productId) continue;

        // console.log(productId);

        const categoryId = await getCategoryIdByName(category);


        if (attributes?.length) {
            for (let index = 0; index < attributes.length; index++) {
                const [attribute, value] = attributes[index];
                await attributesWorker(
                    attribute,
                    value,
                    categoryId,
                    productId
                );
            }
        }

        if (images?.length) {
            for (let index = 0; index < images.length; index++) {
                try {
                    const link = images[index];
                    if (link) await imageWorker(link, productId);
                } catch (error) {
                    console.log('хуйня с картинкой');
                }
            }
        }

        // break;
        console.log(`${index + 1} из ${products.length}`);
    }
    console.log('всё');
    return;

})();


async function getCategoryIdByName(category_name) {
    const category = await new Promise(r => pool.query(
        `SELECT * FROM categories WHERE category_name=?`,
        [category_name],
        function (err, data) {
            if (err) console.log('err #asdakk', err);
            if (!data) r(null);
            if (!data[0]) r(null);
            r(data[0].id);
        }));
    return category;
}