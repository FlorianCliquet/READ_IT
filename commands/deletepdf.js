/*** IMPORT ****/
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { deleteData , Check_If_the_pdf_exist_in_db} = require('../database/db');
const { displayCommands } = require('../helper/display_commands');
const { displayBlueMessage } = require('../helper/display_commands');
const { display_error_message } = require('../helper/display_error_message');


module.exports = {

    /* The data property of the command */
    data: new SlashCommandBuilder()
        .setName('deletepdf')
        .setDescription('Delete a PDF from the database')
        .addStringOption(option =>
            option.setName('pdf_name')
                .setDescription('The PDF name to delete')
                .setRequired(true)),
    
    /* The execute property of the command */
    async execute(interaction) {
        const pdf_name = interaction.options.getString('pdf_name');

        /* Check if the PDF exists in the database */
        const pdfExists = await Check_If_the_pdf_exist_in_db(pdf_name);

        /* If the PDF does not exist in the database */
        if (!pdfExists) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('PDF Not Found')
                .setDescription(`The PDF named "${pdf_name}" does not exist in the database.`)
                .setTimestamp();

            /* Log the command usage */
            displayCommands("deletepdf", interaction.user.tag, 0);
            displayBlueMessage("The PDF named ", pdf_name, " does not exist in the database.\n\n");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        try {
            /* Delete the PDF from the database */
            await new Promise((resolve, reject) => {
                deleteData(pdf_name, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('PDF Deleted')
                .setDescription(`The PDF named "${pdf_name}" has been deleted from the database.`)
                .setTimestamp();

            /* Log the command usage */
            displayCommands("deletepdf", interaction.user.tag, 0);
            displayBlueMessage("The PDF named ", pdf_name, " has been deleted to the database.\n\n");
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            display_error_message('Error executing command: ', error);
            if (!interaction.replied && !interaction.deferred) {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Error deleting data from the database.')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    }
};
