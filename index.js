import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({headless:"new"});
    const page = await browser.newPage();

    await page.goto('https://мотохит27.рф');

    const hrefs = await page.evaluate(function () {
        const linksFromNavbarNodes = document.querySelectorAll('.position-sticky a')
        const linksFromNavbarNodesArray = Array.from(linksFromNavbarNodes);
        const linksFromNavbarNodesArrayHrefs = linksFromNavbarNodesArray.map(({ href }) => href);
        const linksFromNavbarNodesArrayHrefsCategories = linksFromNavbarNodesArrayHrefs.filter(link=>/\/product-category\//.test(link))
        const linksFromNavbarNodesArrayHrefsCategoriesDecoded = linksFromNavbarNodesArrayHrefsCategories.map(link=>decodeURI(link));
        return {
            linksFromNavbarNodesArrayHrefs,
            linksFromNavbarNodesArrayHrefsCategories,
            linksFromNavbarNodesArrayHrefsCategoriesDecoded
        }
    });

    console.log(hrefs);

    await browser.close();
})();