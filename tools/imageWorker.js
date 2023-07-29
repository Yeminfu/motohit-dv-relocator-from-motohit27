import request from "request";
import fs from "fs";
import db_connection from "./dbConnect.js";

export default async function imageWorker(link, productId) {
    const imageName = link.split("/").pop().replace(";");
    console.log('imageName', imageName);
    const imageDownloaded = await imageLoader(link, imageName);
    if (imageDownloaded) {
        await new Promise(r => {
            db_connection.query(
                `INSERT INTO media (type, name, essense_id) VALUES ("product_image", "${imageName}", ${productId} )`,
                function (err) {
                    if (err) {
                        console.log('insert Image To DB error', err);
                    } else {
                        console.log('image saved');
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
                    const filePath = `${process.env.IMAGES_FOLDER}/${filename};`
                    request(uri).pipe(fs.createWriteStream(filePath)).on('close', () => null);
                    r(true);
                } else {
                    r(false);
                    console.log('no image');
                }

            })
    )
};
