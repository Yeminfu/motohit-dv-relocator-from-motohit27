import puppeteer from 'puppeteer';
import getLinksFromSidebar from './tools/getLinksFromSidebar.js';
import getDataFromCategoryPage from './tools/getDataFromCategoryPage.js';
// import cleardbFolder from './tools/cleardbFolder.js';
import defaultLinks from './db/defaultLinks.json.js';
import getDataFromProductPage from './tools/getDataFromProductPage.js';

import createProductInDB from './tools/createProductInDB.js';

let defaultLinksIsOn = false;
console.log('go go go!');



(async () => {


    // return;


    // cleardbFolder();

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
        console.log('link', link);
        const { products, ...asd } = await getDataFromCategoryPage(page, link);
        console.log({ products, asd });
        if (!products) continue;
        productsLinks.push(...products);
    }

    for (let index = 0; index < productsLinks.length; index++) {
        const { link, product_name, category_name } = productsLinks[index];
        console.log({ link, product_name, category_name });
        const dataFromProductPage = await getDataFromProductPage(link, page);


        createProductInDB(category_name, dataFromProductPage, page)


        console.log('dataFromProductPage', dataFromProductPage);
    }

    await browser.close();

})();



