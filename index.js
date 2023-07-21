import puppeteer from 'puppeteer';
import getLinksFromSidebar from './tools/getLinksFromSidebar.js';
import getProductsFromCategoryPage from './tools/getProductsFromCategoryPage.js';
// import defaultLinksa from './db/defaultLinks.json.js';
// let defaultLinks = true && defaultLinksa;
console.log('gonax!');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    // page.evaluate
    // if (defaultLinks) {
    //     console.log(defaultLinks);
    //     return defaultLinks;
    // }
    await page.goto('https://мотохит27.рф');
    const links = await getLinksFromSidebar(page);
    // const links = defaultLinks;

    for (let index = 0; index < links.length; index++) {
        const link = links[index];
        console.log(link);
        const products = await getProductsFromCategoryPage(page, link);
        console.log(products);
    }

    await browser.close();
})();

