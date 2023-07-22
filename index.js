import puppeteer from 'puppeteer';
import getLinksFromSidebar from './tools/getLinksFromSidebar.js';
import getDataFromCategoryPage from './tools/getDataFromCategoryPage.js';
import cleardbFolder from './tools/cleardbFolder.js';
import defaultLinks from './defaultLinks.json.js';

let defaultLinksIsOn = true;
console.log('gonax!');

(async () => {


    cleardbFolder();

    const browser = await puppeteer.launch({ headless: "new" });
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

    for (let index = 0; index < links.length; index++) {
        const link = links[index];
        const { category_name, products } = await getDataFromCategoryPage(page, link);

        if (!products) continue;

        console.log(category_name, products);

    }

    await browser.close();

})();
