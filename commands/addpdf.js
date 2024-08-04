/*** IMPORT ****/
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { addData, fetchData } = require('../database/db');
const { displayBlueMessage } = require('../helper/display_commands');
const { displayCommands } = require('../helper/display_commands');
const { display_error_message } = require('../helper/display_error_message');


module.exports = {

    /* The data property of the command*/
    data: new SlashCommandBuilder()
        .setName('addpdf')
        .setDescription('Add a PDF and his GitHub link to the database')
        .addStringOption(option =>
            option.setName('pdf_name')
                .setDescription('The PDF name to add')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('pdf_link')
                .setDescription('The PDF link to add')
                .setRequired(true)),

    /* The execute property of the command */
    async execute(interaction) {
        const pdf_name = interaction.options.getString('pdf_name');
        const pdf_link = interaction.options.getString('pdf_link');
        const pdfs = await fetchData();

        /* Check if the PDF name or link already exists in the database */
        if (pdfs.some(pdf => pdf.name === pdf_name)) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Duplicate PDF Name')
                .setDescription(`The PDF named "${pdf_name}" already exists in the database.`);

            /* Log the command usage */
            displayCommands("addpdf", interaction.user.tag, 0);
            displayBlueMessage("The PDF named ", pdf_name, " already exists in the database.\n\n");
            await interaction.reply({ embeds: [embed] });
            return;

        /* Check if the PDF link already exists in the database */
        } else if (pdfs.some(pdf => pdf.link === pdf_link)) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Duplicate PDF Link')
                .setDescription(`The PDF linked to "${pdf_link}" already exists in the database.`);
            /* Log the command usage */
            displayCommands("addpdf", interaction.user.tag, 0);
            displayBlueMessage("The PDF linked to ", pdf_link, " already exists in the database.\n\n");
            await interaction.reply({ embeds: [embed] });
            return;
        }

        try {
            /* Add the PDF and link to the database */
            await new Promise((resolve, reject) => {
                addData(pdf_name, pdf_link, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('PDF Added')
                .setDescription(`The PDF named "${pdf_name}" linked to "${pdf_link}" has been added to the database.`);

            /* Log the command usage */
            displayCommands("addpdf", interaction.user.tag, 0);
            displayBlueMessage("The PDF named ", pdf_name, " has been added to the database.");
            displayBlueMessage("The PDF link is ", pdf_link, ".\n\n");
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            display_error_message('Error executing command: ', error);
            if (!interaction.replied && !interaction.deferred) {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Error adding data to the database.');
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};
