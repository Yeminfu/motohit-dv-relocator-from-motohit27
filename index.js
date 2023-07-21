import puppeteer from 'puppeteer';
console.log('go');
let defaultLinks = true && [
    'https://xn--27-vlcpka1acz.xn--p1ai/product-category/тест-драйв-и-аренда-техники/',
    'https://xn--27-vlcpka1acz.xn--p1ai/product-category/велосипеды/',
    'https://xn--27-vlcpka1acz.xn--p1ai/product-category/прицепы-для-водной-и-мототехники/',
    'https://xn--27-vlcpka1acz.xn--p1ai/product-category/запчасти-и-аксессуары/',
    'https://xn--27-vlcpka1acz.xn--p1ai/product-category/спасибо/',
    'https://xn--27-vlcpka1acz.xn--p1ai/product-category/о-нас/'
];

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    if (defaultLinks) {
        // return defaultLinks;
    }
    await page.goto('https://мотохит27.рф');
    const links = await getLinksFromSidebar(page);
    for (let index = 0; index < links.length; index++) {
        const link = links[index];
        console.log(link);
    }
    await browser.close();
})();


async function getLinksFromSidebar(page) {
    return await page.evaluate(function () {
        const linksFromNavbarNodes = document.querySelectorAll('.position-sticky a')
        const linksFromNavbarNodesArray = Array.from(linksFromNavbarNodes);
        const linksFromNavbarNodesArrayHrefs = linksFromNavbarNodesArray.map(({ href }) => href);
        const linksFromNavbarNodesArrayHrefsCategories = linksFromNavbarNodesArrayHrefs.filter(link => /\/product-category\//.test(link))
        const linksFromNavbarNodesArrayHrefsCategoriesDecoded = linksFromNavbarNodesArrayHrefsCategories.map(link => decodeURI(link));
        return linksFromNavbarNodesArrayHrefsCategoriesDecoded;
    });
}