/*** IMPORT ****/
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { displayCommands , displayBlueMessage } = require('../helper/display_commands');
const { display_error_message } = require('../helper/display_error_message');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {

    /* The data property of the command */
    data: new SlashCommandBuilder()
        .setName('turn_on_daily_leetcode')
        .setDescription('Turn on/off the daily Leetcode feature'),

    /* The execute property of the command */
    async execute(interaction) {
        try {
            // Toggle the dailyPDFActive property on the client
            interaction.client.dailyLeetcodeActive = !interaction.client.dailyLeetcodeActive;
            const status = interaction.client.dailyLeetcodeActive ? 'on' : 'off';

            // Update the environment variable
            process.env.DAILY_LEETCODE_ACTIVE = interaction.client.dailyLeetcodeActive ? 'true' : 'false';

            // Update the .env file to persist the change
            const envFilePath = path.resolve(__dirname, '../.env');
            let envFileContent = fs.readFileSync(envFilePath, 'utf-8');
            const newEnvFileContent = envFileContent.replace(
                /DAILY_LEETCODE_ACTIVE=.*/g,
                `DAILY_LEETCODE_ACTIVE=${process.env.DAILY_LEETCODE_ACTIVE}`
            );
            fs.writeFileSync(envFilePath, newEnvFileContent, 'utf-8');

            // Create the embed
            const embed = new EmbedBuilder()
                .setColor(interaction.client.dailyLeetcodeActive ? 0x00ff00 : 0xff0000) // Green for on, Red for off
                .setTitle('Daily Leetcode Feature')
                .setDescription(`The daily Leetcode feature has been turned ${status}.`)
                .setTimestamp();

            // Log the command usage
            displayCommands("turn_on_daily_leetcode", interaction.user.tag, 0);
            displayBlueMessage("Daily Leetcode feature has been turned ", status, "");
            console.log("\n\n");

            // Reply to the interaction with the embed
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            display_error_message('Error executing command: ', error);
            await interaction.reply('There was an error while executing this command!');
        }
    }
};
