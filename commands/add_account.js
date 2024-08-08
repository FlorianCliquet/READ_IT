/*** IMPORT ****/
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { add_leetcode_account, fetch_leetcode_accounts } = require('../database/db');
const { displayCommands } = require('../helper/display_commands');
const { display_error_message } = require('../helper/display_error_message');
const {displayBlueMessage} = require('../helper/display_commands');

module.exports = {

    /* The data property of the command */
    data: new SlashCommandBuilder()
        .setName('add_account')
        .setDescription('Add a leetcode account to the database')
        .addStringOption(option =>
            option.setName('account_name')
                .setDescription('The leetcode account name to add')
                .setRequired(true)),
    
    /* The execute property of the command */
    async execute(interaction) {
        const account_name = interaction.options.getString('account_name');
        const discord_user_id = interaction.user.id;

        /* Fetch the accounts from the database */
        const accounts = await fetch_leetcode_accounts();

        /* Check if the account name already exists in the database */
        if (accounts.some(account => account.name === account_name)) {
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Duplicate Account Name')
                .setDescription(`The account named "${account_name}" already exists in the database.`);

            /* Log the command usage */
            displayCommands("add_account", interaction.user.tag, 0);
            displayBlueMessage("The account named ", account_name, " already exists in the database.\n\n");
            await interaction.reply({ embeds: [embed] });
            return;
        }

        try {
            /* Add the account name to the database */
            await new Promise((resolve, reject) => {
                add_leetcode_account(account_name, discord_user_id, (error) => {
                    if (error) {
                        display_error_message('Error adding account to the database: ', error);
                        reject();
                    } else {
                        resolve();
                    }
                });
            });

            /* Create the embed */
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Account Added')
                .setDescription(`The account named "${account_name}" has been added to the database.`);

            /* Log the command usage */
            displayCommands("add_account", interaction.user.tag, 0);
            displayBlueMessage("The account named ", account_name, " has been added to the database.\n\n");
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            display_error_message('Error executing command: ', error);
            await interaction.reply('There was an error while executing this command!');
        }
    }
};