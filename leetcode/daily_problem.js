/* IMPORT */
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { displayCommands , displayBlueMessage } = require('../helper/display_commands');
const { display_error_message } = require('../helper/display_error_message');

/* Read the .env file */
dotenv.config();
const dailyPDFActive = process.env.DAILY_PDF_ACTIVE === 'true';

/* Read the config file for the API URL */
const configPath = path.resolve(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const apiURL = config.API_DAILY_LEETCODE;

async function daily_problem() {
    try {
        displayCommands("Daily Problem", "", 1);
        // Check if the daily PDF feature is active
        if (!dailyPDFActive) {
            display_error_message('The daily PDF feature is turned off.');
            return;
        }

        // Fetch the daily problem from the API
        const response = await fetch(`${apiURL}`);
        const data = await response.json();
        displayBlueMessage("The daily problem is: ", data.questionLink, "\n\n");
        return data;
    } catch (error) {
        display_error_message('Error fetching data from the API: ', error);
    }    
}

module.exports = { daily_problem };