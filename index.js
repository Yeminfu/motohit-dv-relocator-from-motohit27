import puppeteer from 'puppeteer';
import getLinksFromSidebar from './tools/getLinksFromSidebar.js';
import getDataFromCategoryPage from './tools/getDataFromCategoryPage.js';
import cleardbFolder from './tools/cleardbFolder.js';

// import defaultLinksa from './db/defaultLinks.json.js';
// let defaultLinks = true && defaultLinksa;
console.log('gonax!');



(async () => {

    cleardbFolder()

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto('https://мотохит27.рф');
    const links = await getLinksFromSidebar(page);

    for (let index = 0; index < links.length; index++) {
        const link = links[index];
        console.log(link);
        const products = await getDataFromCategoryPage(page, link);
        console.log(products);
    }

    await browser.close();
})();

