export default async function getProductsFromCategoryPage(page, link) {
    await page.goto(link, { timeout: 0 });

    await page.waitForSelector('h1');

    const category_name = await page.evaluate(() => document.querySelector('h1').innerText);

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


    const video = await page.evaluate(() => Array.from(document.querySelectorAll('iframe')).map(iframe => iframe.src) );

    return { category_name, products, video };
}