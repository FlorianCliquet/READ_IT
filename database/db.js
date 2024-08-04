/*** IMPORT ****/
const mysql = require('mysql');
require('dotenv').config();

/*** const needed for the db ***/
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME
};

/*** FUNCTIONS ***/

/* Function to get a connection to the database */
function getDbConnection() {
    return mysql.createConnection(dbConfig);
}

/* Function to add data to the database */
function addData(PDF_NAME, PDF_LINK, callback) {
    const conn = getDbConnection();
    const query = 'INSERT INTO PDF (PDF_NAME, PDF_LINK) VALUES (?, ?)';

    conn.query(query, [PDF_NAME, PDF_LINK], (error, results) => {
        conn.end();
        if (error) {
            return callback(error);
        }
        callback(null, results);
    });
}

/* Function to fetch data from the database */
function fetchData() {
    return new Promise((resolve, reject) => {
        const conn = getDbConnection();
        const query = 'SELECT PDF_NAME as name, PDF_LINK as link FROM PDF ORDER BY PDF_NAME';

        conn.query(query, (error, results) => {
            conn.end();
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

/* Function to delete data from the database */
function deleteData(PDF_NAME, callback) {
    const conn = getDbConnection();
    const query = 'DELETE FROM PDF WHERE PDF_NAME = ?';

    conn.query(query, [PDF_NAME], (error, results) => {
        conn.end();
        if (error) {
            return callback(error);
        }
        callback(null, results);
    });
}

/* Function to fetch PDF_NAME with PDF_COUNT = 0 */
function fetchPDF_Name_with_count_0() {
    return new Promise((resolve, reject) => {
        const conn = getDbConnection();
        const query = 'SELECT PDF_NAME as name , PDF_LINK as link FROM PDF WHERE PDF_COUNT = 0';

        conn.query(query, (error, results) => {
            conn.end();
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

/* Function to update PDF_COUNT */
async function updatePDF_Count(PDF_NAME) {
    return new Promise((resolve, reject) => {
        const conn = getDbConnection();
        const query = 'UPDATE PDF SET PDF_COUNT = 1 WHERE PDF_NAME = ?';

        conn.query(query, [PDF_NAME], (error, results) => {
            conn.end();
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

/* Function to set every PDF_COUNT to 0 */
async function setEveryPDF_Count_to_0() {
    return new Promise((resolve, reject) => {
        const conn = getDbConnection();
        const query = 'UPDATE PDF SET PDF_COUNT = 0';

        conn.query(query, (error, results) => {
            conn.end();
            if (error) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

/* Function to check if the PDF exists in the database */
async function Check_If_the_pdf_exist_in_db(PDF_NAME) {
    return new Promise((resolve, reject) => {
        const conn = getDbConnection();
        const query = 'SELECT COUNT(*) AS count FROM PDF WHERE PDF_NAME = ?';

        conn.query(query, [PDF_NAME], (error, results) => {
            conn.end();
            if (error) {
                reject(error);
            } else {
                const count = results[0].count;
                resolve(count > 0);
            }
        });
    });
}

/* Function to check if there is a PDF in the database */
async function Check_If_There_is_pdf_in_db() {
    return new Promise((resolve, reject) => {
        const conn = getDbConnection();
        const query = 'SELECT COUNT(*) AS count FROM PDF';

        conn.query(query, (error, results) => {
            conn.end();
            if (error) {
                reject(error);
            } else {
                const count = results[0].count;
                resolve(count > 0);
            }
        });
    });
}


module.exports = { Check_If_the_pdf_exist_in_db, addData, fetchData, deleteData, fetchPDF_Name_with_count_0, updatePDF_Count, setEveryPDF_Count_to_0 , Check_If_There_is_pdf_in_db};