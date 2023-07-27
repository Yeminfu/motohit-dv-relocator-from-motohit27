import fs from "fs";
import path from "path";
import db_connection from "./dbConnect.js";


export default async function clearProducts() {
    await new Promise(r => {
        db_connection.query(
            `DELETE FROM attr_prod_relation`,
            function (err, res) {
                if (err) {
                    console.log('Err #c83b2m', err);
                }
                r();
            }
            )
    });

    await new Promise(r => {
        db_connection.query(
            `DELETE FROM attributes_values`,
            function (err, res) {
                if (err) {
                    console.log('Err #c83bsd2m', err);
                }
                r();
            }
            )
    });

    await new Promise(r => {
        db_connection.query(
            `DELETE FROM attributes`,
            function (err, res) {
                if (err) {
                    console.log('Err #c3c2dcc', err);
                }
                r();
            }
        )
    });



    await new Promise(r => {
        db_connection.query(
            `DELETE FROM media`,
            function (err, res) {
                if (err) {
                    console.log('Err #c3c2dcc', err);
                }
                r();
            }
        )
    });


    await new Promise(r => {
        db_connection.query(
            `DELETE FROM products`,
            function (err, res) {
                if (err) {
                    console.log('Err #z02lf', err);
                }
                r();
            }
        )
    });
    
    const directory = process.env.IMAGES_FOLDER;

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
            });
        }
    });
    

}