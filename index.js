import puppeteer from 'puppeteer';
import getLinksFromSidebar from './tools/getLinksFromSidebar.js';
import defaultLinksa  from './db/defaultLinks.json.js';
let defaultLinks = true && defaultLinksa;
console.log('gonax!');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    if (defaultLinks) {
        console.log(defaultLinks);
        return defaultLinks;
    }
    await page.goto('https://мотохит27.рф');
    const links = await getLinksFromSidebar(page);
    for (let index = 0; index < links.length; index++) {
        const link = links[index];
        console.log(link);
    }
    await browser.close();
})();

