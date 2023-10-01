export default async function getLinksFromSidebar(page) {
    return await page.evaluate(function () {
        const linksFromNavbarNodes = document.querySelectorAll('.position-sticky a')
        const linksFromNavbarNodesArray = Array.from(linksFromNavbarNodes);
        const linksFromNavbarNodesArrayHrefs = linksFromNavbarNodesArray.map(({ href }) => href);
        const linksFromNavbarNodesArrayHrefsCategories = linksFromNavbarNodesArrayHrefs.filter(link => /\/product-category\//.test(link))
        const linksFromNavbarNodesArrayHrefsCategoriesDecoded = linksFromNavbarNodesArrayHrefsCategories.map(link => decodeURI(link));
        return linksFromNavbarNodesArrayHrefsCategoriesDecoded;
    });
}