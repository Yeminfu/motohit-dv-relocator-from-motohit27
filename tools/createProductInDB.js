import transliterator from './transliterator.js';
import slugify from 'slugify';
import db_connection, { pool } from './dbConnect.js';
import * as cheerio from 'cheerio';

export default async function createProductInDB(category_name, dataFromProductPage) {

    const categoryId = await (async () => {
        const category = await new Promise(r => db_connection.query(`SELECT * FROM categories WHERE category_name="${category_name}"`,
            function (err, data) {
                if (err) console.log('err #sdfsmvksu', err);
                if (!data) r(null);
                if (!data[0]) r(null)
                r(data[0].id);
            }));
        return category;
    })();

    const description = !!dataFromProductPage.description
        ? (() => {
            const html = dataFromProductPage.description;
            const $ = cheerio.load(html);
            $('*').each(function () {
                const attributes = Object.keys($(this).get(0).attribs);
                attributes.forEach(attribute => {
                    $(this).removeAttr(attribute)
                });
            });
            $('html, head, body').replaceWith($('html, head, body').html())
            return $.html();
        })()
        : "";

    const stock_status_id = await getStockStatusIdByText(dataFromProductPage.stockStatusText);
    const values = [
        ["product_name", dataFromProductPage.product_name],
        ["slug", slugify(transliterator(dataFromProductPage.product_name.replace(/[^ a-zA-Zа-яА-Я0-9-]/igm, "")))],
        ["description", description],
        ["price", dataFromProductPage.price ? dataFromProductPage.price : 0],
        ["category", categoryId],
        ["stock_status", stock_status_id],
    ];

    const qs = `INSERT INTO products ( ${values.map(x => x[0]).join(", ")} ) VALUES ( ${values.map(_ => "?").join(", ")} )`;

    const productId = await new Promise(r =>
        pool.query(
            qs,
            values.map(x => x[1]),
            function (err, data) {
                if (err) {
                    console.log('err #fdsfsdfkJ5', err);
                }
                r(data.insertId);
            }));

    return productId;

}


async function getStockStatusIdByText(text) {
    return new Promise(resolve => {
        db_connection.query(
            "SELECT * FROM stock_statuses WHERE status_name = ?",
            [text],
            function (err, res) {
                if (err) {
                    console.log('err #kddasm', err);
                }
                resolve(res?.pop()?.id)
            }
        )
    })
}