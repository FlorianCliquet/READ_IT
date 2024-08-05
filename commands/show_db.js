const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { fetchData } = require('../database/db');
const { displayCommands } = require('../helper/display_commands');
const { displayBlueMessage } = require('../helper/display_commands');
const { display_error_message } = require('../helper/display_error_message');

module.exports = {

    /* The data property of the command */
    data: new SlashCommandBuilder()
        .setName('show_db')
        .setDescription('Show the database contents'),

    /* The execute property of the command */
    async execute(interaction) {
        try {
            const results = await fetchData();

            /* If there are no PDFs in the database */
            if (results.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Database Contents')
                    .setDescription('No PDFs found in the database.')
                    .setTimestamp();
                
                /* Log the command usage */
                displayCommands("show_db", interaction.user.tag, 0);
                displayBlueMessage("No PDFs found in the database.\n\n");

                await interaction.reply({ embeds: [embed] });
                return;
            }

            /* If there are PDFs in the database */

            /* Pagination */
            const ITEMS_PER_PAGE = 10;
            const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

            const generateEmbed = (page) => {
                const start = page * ITEMS_PER_PAGE;
                const end = start + ITEMS_PER_PAGE;
                const currentItems = results.slice(start, end);

                const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('Database Contents')
                    .setDescription('The database contains the following PDFs:')
                    .setTimestamp()
                    .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

                currentItems.forEach(result => {
                    embed.addFields({ name: result.name, value: result.link });
                });

                return embed;
            };

            let currentPage = 0;
            const embedMessage = await interaction.reply({ embeds: [generateEmbed(currentPage)], fetchReply: true });

            if (totalPages > 1) {
                await embedMessage.react('⬅️');
                await embedMessage.react('➡️');

                const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && !user.bot;
                const collector = embedMessage.createReactionCollector({ filter, time: 60000 });

                collector.on('collect', (reaction, user) => {
                    reaction.users.remove(user);

                    if (reaction.emoji.name === '➡️') {
                        currentPage = (currentPage + 1) % totalPages;
                    } else if (reaction.emoji.name === '⬅️') {
                        currentPage = (currentPage - 1 + totalPages) % totalPages;
                    }

                    embedMessage.edit({ embeds: [generateEmbed(currentPage)] }).catch(console.error);
                });

                collector.on('end', () => {
                    embedMessage.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                });
            }

            /* Log the command usage */
            displayCommands("show_db", interaction.user.tag, 0);
            displayBlueMessage(`The Database content has been shown. There are ${totalPages} page(s).\n\n`);
            
        } catch (error) {
            display_error_message('Error executing command: ', error);
            if (!interaction.replied && !interaction.deferred) {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Error fetching data from the database.')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    }
};
