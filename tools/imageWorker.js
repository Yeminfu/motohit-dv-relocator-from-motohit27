import request from "request";
import fs from "fs";
import db_connection, { pool } from "./dbConnect.js";

export default async function imageWorker(link, productId) {
    // console.log('linklinklink', link);

    const parts = link.split("/");

    const imageName = parts.pop();
    // console.log('linklinklinklinklink', parts);

    const encodedLink = parts.join('/') + "/" + encodeURIComponent(imageName);

    try {
        const imageDownloaded = await imageLoader(encodedLink, imageName);

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
    } catch (error) {
        console.log('произошла неведомая хуйня #jfjd4', error);
    }
}
// https://xn--27-vlcpka1acz.xn--p1ai/wp-content/uploads/2023/11/AVR_4866-1-С-ТЕНЬЮ.webp
async function imageLoader(uri, filename) {
    return await new Promise(
        r =>
            request.head(encodeURI(uri), function (err, res, body) {
                if (res?.headers['content-length']) {
                    const filePath = `${process.env.IMAGES_FOLDER}/${filename}`;
                    request(uri).pipe(fs.createWriteStream(filePath)).on('close', () => null);
                    r(true);
                } else {
                    r(false);
                    // console.log('no image', uri);
                    // console.log('resres', res);
                    // console.log('body', body);
                    // console.log('err', err);
                }

            })
    )
};
