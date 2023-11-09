import fs from "fs";
import path from "path";
import db_connection, { pool } from "./dbConnect.js";
import categoriesList from "../db/categoriesList.json.js";
import slugify from "slugify";
import transliterator from "./transliterator.js";

export default async function clearProducts() {
    await db_connection.promise().query(`DELETE FROM attr_prod_relation`);
    await db_connection.promise().query(`DELETE FROM attributes_values`);
    await db_connection.promise().query(`DELETE FROM attributes`);
    await db_connection.promise().query(`DELETE FROM media`);
    await db_connection.promise().query(`DELETE FROM products`);
    await db_connection.promise().query(`DELETE FROM categories WHERE parent IS NOT NULL`);
    await db_connection.promise().query(`DELETE FROM categories`);

    const directory = process.env.IMAGES_FOLDER;

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
            });
        }
    });

    for (let index = 0; index < categoriesList.length; index++) {
        const category = categoriesList[index];
        await categoryWorker(category);
    }
}

async function categoryWorker(cat, parent_name) {
    const { category_name, children } = cat;
    if (!children) {
        if (parent_name) { // создаем потомка-категорию
            saveCategory(category_name, parent_name)
        } else { // создаем глав категорию без детей
            saveCategory(category_name);
        }
    } else { // создаем глав категорию с детьми
        saveCategory(category_name);
        for (let index = 0; index < children.length; index++) {
            const child = children[index];
            await categoryWorker(child, category_name);
        }
    }
}

async function saveCategory(category_name, parent) {
    const categorySlug = slugify(transliterator(category_name));
    const parentId = parent ? await getCategoryIdByName(parent) : null;
    return await db_connection.promise().query(
        "INSERT INTO categories (category_name,slug, parent) VALUES (?,?,?)",
        [category_name, categorySlug, parentId]
    )
}

async function getCategoryIdByName(name) {
    return db_connection.promise().query(
        "SELECT * FROM categories WHERE category_name = ?",
        [name]
    )
        .then(([res]) => {
            return res.shift().id;
        });
}