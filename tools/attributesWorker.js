import db_connection from "./dbConnect.js";

export default async function attributesWorker(attribute, attributeValue, categoryId, productId) {

    const attributeId = await new Promise(r => {
        db_connection.query(
            `SELECT * FROM attributes WHERE category = ${categoryId} AND attribute_name = "${attribute}"`,
            function (err, res) {
                if (err) console.log('attributesWorker err attributeExists #adk3nc0', err);
                if (res?.length) {
                    r(res[0].id)
                }

            }
        )
    });

    if (!attributeId) {
        console.log('Ошибка #c2jkx324'); return;
    }

    const attributeValueId = await new Promise(r => {
        db_connection.query(
            `SELECT * FROM attributes_values WHERE attribute = ${attributeId} AND value_name = "${attributeValue}"`,
            function (err, res) {
                if (err) console.log('attributesWorker err attributeExists #jc8_2d', err);
                if (res?.length) {
                    r(res[0].id)
                }
            }
        )
    });

    await new Promise(r => {
        db_connection.query(
            `INSERT INTO attr_prod_relation (attribute, attribute_value, product) VALUES (${attributeId}, ${attributeValueId}, ${productId})`,
            function (err, res) {
                if (err) console.log('attributesWorker err attributeExists #n4_cs', err);
                console.log('Добавили атрибут', res.insertId, JSON.stringify({attribute, attributeValue, categoryId, productId}));
            }
        )
    });

}