export default async function getProductsFromCategoryPage(page, link) {
    await page.goto(link);

    await page.waitForSelector('h1');

    const products = await page.evaluate(function () {

        if (document.querySelector('.categorys')) return null;

        const productsNodes = document.querySelectorAll('.products li');

        if (productsNodes.length === 0) return null;

        const productsNodesArray = Array.from(productsNodes);

        const productsNodesArrayWithContent = productsNodesArray.map(x => {
            const link = Array.from(x.querySelectorAll('a')).pop()
            return {
                category_name: document.querySelector('h1').innerText,
                product_name: x.querySelector('h2').innerText,
                link: decodeURI(link.href),
            }
        });

        return productsNodesArrayWithContent;
    });
    return products;
}