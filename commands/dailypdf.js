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
        .setName('turn_on_daily_pdf')
        .setDescription('Turn on/off the daily PDF feature'),
    
    /* The execute property of the command */
    async execute(interaction) {
        try {
            // Toggle the dailyPDFActive property on the client
            interaction.client.dailyPDFActive = !interaction.client.dailyPDFActive;
            const status = interaction.client.dailyPDFActive ? 'on' : 'off';

            // Update the environment variable
            process.env.DAILY_PDF_ACTIVE = interaction.client.dailyPDFActive ? 'true' : 'false';

            // Update the .env file to persist the change
            const envFilePath = path.resolve(__dirname, '../.env');
            let envFileContent = fs.readFileSync(envFilePath, 'utf-8');
            const newEnvFileContent = envFileContent.replace(
                /DAILY_PDF_ACTIVE=.*/g,
                `DAILY_PDF_ACTIVE=${process.env.DAILY_PDF_ACTIVE}`
            );
            fs.writeFileSync(envFilePath, newEnvFileContent, 'utf-8');

            // Create the embed
            const embed = new EmbedBuilder()
                .setColor(interaction.client.dailyPDFActive ? 0x00ff00 : 0xff0000) // Green for on, Red for off
                .setTitle('Daily PDF Feature')
                .setDescription(`The daily PDF feature has been turned ${status}.`)
                .setTimestamp();

            // Log the command usage
            displayCommands("turn_on_daily_pdf", interaction.user.tag, 0);
            displayBlueMessage("Daily PDF feature has been turned ", status, "");
            console.log("\n\n");

            // Reply to the interaction with the embed
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            display_error_message('Error executing command: ', error);
            await interaction.reply('There was an error while executing this command!');
        }
    }
};
