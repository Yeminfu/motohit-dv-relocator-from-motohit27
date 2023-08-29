import request from "request";
import fs from "fs";
import db_connection, { pool } from "./dbConnect.js";

export default async function imageWorker(link, productId) {
    const imageName = link.split("/").pop();
    const imageDownloaded = await imageLoader(link, imageName);
    if (imageDownloaded) {
        await new Promise(r => {
            pool.query(
                `INSERT INTO media (type, name, essense_id) VALUES ("product_image", ?, ? )`,
                [imageName, productId],
                function (err) {
                    if (err) {
                        console.log('err #kfdsfvjUn4', err);
                    }
                    r();
                }
            )
        });
    } else {
        console.log('no image');
    }
}

async function imageLoader(uri, filename) {
    return await new Promise(
        r =>
            request.head(uri, function (err, res, body) {
                if (res.headers['content-length']) {
                    const filePath = `${process.env.IMAGES_FOLDER}/${filename}`;
                    request(uri).pipe(fs.createWriteStream(filePath)).on('close', () => null);
                    r(true);
                } else {
                    r(false);
                    console.log('no image');
                }

            })
    )
};
