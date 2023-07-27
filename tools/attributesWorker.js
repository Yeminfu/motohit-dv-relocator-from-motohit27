import db_connection from "./dbConnect.js";

export default async function attributesWorker(attribute, attributeValue, categoryId, productId) {

    let attributeId = await new Promise(r => {
        db_connection.query(
            `INSERT INTO attributes (attribute_name, category) VALUES ("${attribute}", "${categoryId}")`,
            function (err, res) {
                if (err) console.log('attributesWorker err attributeExists #adk3nc0', err);
                if (res) {
                    r(resdata.insertId)
                } else {
                    r(null);
                }

            }
        )
    });

    if (!attributeId) {
        console.log('Ошибка #c2jkx324'); return;
    }


    let attributeValueId = await new Promise(r => {
        db_connection.query(
            `INSERT INTO  attributes_values WHERE (attribute, value_name) VALUES ("${attributeId}", "${attributeValue}")`,
            function (err, res) {
                if (err) console.log('attributesWorker err attributeExists #adk3nc0', err);
                if (res) {
                    r(resdata.insertId)
                } else {
                    r(null);
                }

            }
        )
    });

    if (!attributeValueId) {
        console.log('Ошибка #cn47jsdc'); return;
    }

    await new Promise(r => {
        db_connection.query(
            `INSERT INTO attr_prod_relation (attribute, attribute_value, product) VALUES (${attributeId}, ${attributeValueId}, ${productId})`,
            function (err, res) {
                if (err) console.log('attributesWorker err attributeExists #n4_cs', err);
                console.log('Добавили атрибут', res.insertId, JSON.stringify({ attribute, attributeValue, categoryId, productId }));
                r();
            }
        )
    });

}