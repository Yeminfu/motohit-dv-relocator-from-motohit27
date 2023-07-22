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

    const categoryId = await (async () => {
        const category = await new Promise(r => db_connection.query(`SELECT * FROM categories WHERE category_name="${category_name}"`, function (err, data) {
            if (!data) r(null);
            if (!data[0]) r(null)
            r(data[0].id);
        }));
        return category;
    })();

    const link = "https://мотохит27.рф/product/hilton-junior-купить-электросамокат/";
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'], });
    const page = await browser.newPage();

    const dataFromProductPage = await getDataFromProductPage(link, page);
    // console.log(dataFromProductPage);
    const values = [
        ["product_name", dataFromProductPage.product_name],
        ["slug", `"${slugify(transliterator(dataFromProductPage.product_name.replace(/[^ a-zA-Zа-яА-Я0-9-]/igm, "")))}"`],
        ["description", `"${dataFromProductPage.description}"`],
        ["price", dataFromProductPage.price],
        ["category", categoryId],
    ];

    const qs = `INSERT INTO products ( ${values.map(x => x[0])} ) VALUES ( ${values.map(x => x[1])} )`;


    db_connection.query(qs, function (err, data) {
        console.log('data', data);
        console.log('err', err);

        // if (!data) r(null);
        // if (!data[0]) r(null)
        // r(data[0].id);
    });

    // console.log({ values, qs });
    console.log(qs);

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
