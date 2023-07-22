import puppeteer from 'puppeteer';
import getLinksFromSidebar from './tools/getLinksFromSidebar.js';
import getDataFromCategoryPage from './tools/getDataFromCategoryPage.js';
import cleardbFolder from './tools/cleardbFolder.js';
import defaultLinks from './defaultLinks.json.js';
import getDataFromProductPage from './tools/getDataFromProductPage.js';

let defaultLinksIsOn = false;
console.log('gonax!');

(async () => {


    cleardbFolder();

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
        const { products } = await getDataFromCategoryPage(page, link);
        if (!products) continue;
        productsLinks.push(...products);
    }

    for (let index = 0; index < productsLinks.length; index++) {
        const { link, product_name, category_name } = productsLinks[index];
        const dataFromProductPage = await getDataFromProductPage(link, page);
        console.log('dataFromProductPage', dataFromProductPage);
    }

    await browser.close();

})();
