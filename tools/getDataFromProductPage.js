export default async function getDataFromProductPage(link, page) {
    await page.goto(link);

    await page.waitForSelector('h1');

    const productData = await page.evaluate(function () {

        const imagesLinks = Array.from(document.querySelectorAll('#big-pic, .moto-slider-shorts img')).map(el => el.src).filter((value, index, array) => { return array.indexOf(value) === index; });

        const description = (() => {
            try {
                const cols = document.querySelectorAll('.col-md-6');
                const colsArr = Array.from(cols);

                const descriptionArea = colsArr
                    .find(div => div.querySelector('.h4')?.innerText === 'Описание')
                    .querySelector('.col-lg');

                const childrenOfDescriptionArea = Array.from(descriptionArea.children);
                const validChildrenIfDescriptionArea = childrenOfDescriptionArea.filter(element => {
                    return !((element.querySelector('.h4')?.innerText) === 'Описание')
                });

                const childrenHtml = validChildrenIfDescriptionArea
                    .map(children => children.outerHTML)
                    .join("\n");

                const description = childrenHtml;
                return description;
            } catch (error) {
                console.log('Нет описания');
            }

        })();




        const priceText = document.querySelector('span.h5.font-weight-bold.r_price')?.innerText.replace(/[^0-9]/img, '');
        const price = priceText ? Number(priceText) : null;

        const attributesTableNode = document.querySelector('table.table.table-sm.table-bordered');
        const rowsNodes = attributesTableNode?.querySelectorAll('tbody tr');
        const attributes = rowsNodes ?
            Array.from(rowsNodes).map(x => ({
                attribute: x.querySelectorAll('td')[0].innerText,
                value: x.querySelectorAll('td')[1].innerText,
            }))
            : null;


        return {
            product_name: document.querySelector('h1').innerText,
            imagesLinks,
            description,
            price,
            attributes,
        }
    });
    return productData;
}