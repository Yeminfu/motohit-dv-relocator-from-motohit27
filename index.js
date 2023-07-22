import puppeteer from 'puppeteer';
import getLinksFromSidebar from './tools/getLinksFromSidebar.js';
import getDataFromCategoryPage from './tools/getDataFromCategoryPage.js';
// import cleardbFolder from './tools/cleardbFolder.js';
import defaultLinks from './db/defaultLinks.json.js';
import getDataFromProductPage from './tools/getDataFromProductPage.js';
import transliterator from './tools/transliterator.js';
import slugify from 'slugify';
import db_connection from './tools/dbConnect.js';

let defaultLinksIsOn = false;
console.log('go go go!');

(async function createProductInDB(category_name) {
    console.log(category_name);

    db_connection.query("SELECT * FROM products", function (err, data) {
        console.log('err', err);
        // console.log('data', data);
    })


    const link = "https://мотохит27.рф/product/hilton-junior-купить-электросамокат/";
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'], });
    const page = await browser.newPage();

    const dataFromProductPage = await getDataFromProductPage(link, page);
    console.log(dataFromProductPage);
    const values = [
        ["product_name", dataFromProductPage.product_name],
        ["slug", `"${slugify(transliterator(dataFromProductPage.product_name.replace(/[^ a-zA-Zа-яА-Я0-9-]/igm, "")))}"`],
        ["description", `"${dataFromProductPage.description}"`],
        ["price", dataFromProductPage.price],
        ["category", `"someshing"`],
    ];
    console.log({ values });

    // "INSERT INTO products (	product_name, slug, description, price, category)"
    await browser.close();
})("Электросамокаты");

// (async () => {


//     return;


//     // cleardbFolder();

//     const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'], });
//     const page = await browser.newPage();

//     let links;

//     if (defaultLinksIsOn) {
//         console.log('нахуй главную');
//         links = defaultLinks;
//     } else {
//         console.log('открываем главную');
//         await page.goto('https://мотохит27.рф');
//         links = await getLinksFromSidebar(page);
//     }

//     const productsLinks = [];
//     for (let index = 0; index < links.length; index++) {
//         const link = links[index];
//         console.log('link', link);
//         const { products, ...asd } = await getDataFromCategoryPage(page, link);
//         console.log({ products, asd });
//         if (!products) continue;
//         productsLinks.push(...products);
//     }

//     for (let index = 0; index < productsLinks.length; index++) {
//         const { link, product_name, category_name } = productsLinks[index];
//         console.log({ link, product_name, category_name });
//         const dataFromProductPage = await getDataFromProductPage(link, page);
//         console.log('dataFromProductPage', dataFromProductPage);
//     }

//     await browser.close();

// })();
