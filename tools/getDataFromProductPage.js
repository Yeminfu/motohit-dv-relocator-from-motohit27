export default async function getDataFromProductPage(link, page) {
    await page.goto(link);

    await page.waitForSelector('h1');

    const productData = await page.evaluate(function () {

        const imagesLinks = Array.from(document.querySelectorAll('#big-pic, .moto-slider-shorts img')).map(el => el.src).filter((value, index, array) => { return array.indexOf(value) === index; });


        const cols = document.querySelectorAll('.col-md-6');
        const colsArr = Array.from(cols);
        const descriptionArea = colsArr
            .find(div => div.querySelector('.h4')?.innerText === 'Описание')
            .querySelector('.col-lg');
        const childrenOfDescriptionArea = Array.from(descriptionArea.children);
        const validChildren = childrenOfDescriptionArea.filter(element => {
            return !((element.querySelector('.h4')?.innerText) === 'Описание')
        });
        const childrenHtml = validChildren
            .map(children => children.outerHTML)
            .join("\n");

        const description = childrenHtml;


        return {
            product_name: document.querySelector('h1').innerText,
            imagesLinks,
            description
        }
    });
    return productData;
}

