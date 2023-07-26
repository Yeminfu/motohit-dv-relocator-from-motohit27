import transliterator from './transliterator.js';
import slugify from 'slugify';
import db_connection from './dbConnect.js';
import * as cheerio from 'cheerio';

export default async function createProductInDB(category_name, dataFromProductPage) {

    const categoryId = await (async () => {
        const category = await new Promise(r => db_connection.query(`SELECT * FROM categories WHERE category_name="${category_name}"`, function (err, data) {
            if (!data) r(null);
            if (!data[0]) r(null)
            r(data[0].id);
        }));
        return category;
    })();


    const description = !!dataFromProductPage.description
        ? (() => {
            const $ = cheerio.load(dataFromProductPage.description);
            $('html').find('*').each(function () {
                $(this).removeAttr('class')
            });
            return $.html();
        })()
        : null;

    const values = [
        ["product_name", `"${dataFromProductPage.product_name}"`],
        ["slug", `"${slugify(transliterator(dataFromProductPage.product_name.replace(/[^ a-zA-Zа-яА-Я0-9-]/igm, "")))}"`],
        ["description", `"${description}"`],
        ["price", dataFromProductPage.price],
        ["category", categoryId],
    ];

    const qs = `INSERT INTO products ( ${values.map(x => x[0]).join(", ")} ) VALUES ( ${values.map(x => x[1]).join(", ")} )`;

    console.log(qs);

    const productId = await new Promise(r => db_connection.query(qs, function (err, data) {
        if (err) {
        }
        console.log('err', err);
        r(data.insertId);
    }));

    console.log('productId', productId);
    return productId;

}