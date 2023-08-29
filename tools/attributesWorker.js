import db_connection, { pool } from "./dbConnect.js";

export default async function attributesWorker(attribute, attributeValue, categoryId, productId) {

    let attributeId = await new Promise(r => {
        db_connection.query(
            `INSERT INTO attributes (attribute_name, category) VALUES ("${attribute}", "${categoryId}")`,
            function (err, res) {
                if (err?.code !== "ER_DUP_ENTRY") console.log('attributesWorker err attributeExists #adk3nc0', err);
                if (res) {
                    r(res.insertId)
                } else {
                    // r(null);
                    if (err.code === "ER_DUP_ENTRY") {
                        db_connection.query(
                            `SELECT * FROM attributes WHERE category = ${categoryId} AND attribute_name = "${attribute}"`,
                            function (err, res) {
                                if (err) console.log('err', err);
                                if (res?.length) {
                                    r(res[0].id)
                                } else {
                                    r(null);
                                }

                            }
                        )
                    } else {
                        r(null);
                    }
                }

            }
        )
    });

    if (!attributeId) {
        console.log('Ошибка #c2jkx324'); return;
    }


    let attributeValueId = await new Promise(r => {
        const query = `INSERT INTO attributes_values (attribute, value_name) VALUES (?, ?)`;
        const values = [attributeId, attributeValue];
        pool.query(
            query, values,
            function (err, res) {
                if (err) console.log('err #clcmd9k3m', err);
                if (res) {
                    // console.log('добавили начение атрибута');
                    r(res.insertId)
                } else {
                    pool.query(
                        `SELECT * FROM attributes_values WHERE attribute = ? AND value_name = ?`,
                        [attributeId, attributeValue],
                        function (err, res) {
                            if (err) console.log('attributesWorker err attributeExists #jc8_2d', err);
                            if (res?.length) {
                                r(res[0].id)
                            } else {
                                r(null);
                            }
                        }
                    )
                }

            }
        )
    });

    if (!attributeValueId) {
        console.log('Ошибка #cn47jsdc'); return;
    }

    await new Promise(r => {
        db_connection.query(
            `INSERT INTO attr_prod_relation (attribute, attribute_value, product) VALUES (?, ?, ?)`,
            [attributeId, attributeValueId, productId],
            function (err, res) {
                if (err) console.log('attributesWorker err attributeExists #n4_cs', err);
                // console.log('Добавили атрибут', res.insertId, JSON.stringify({ attribute, attributeValue, categoryId, productId }));
                r();
            }
        )
    });

}