/*** IMPORT ****/
const { EmbedBuilder } = require('discord.js');
const {
    fetchPDF_Name_with_count_0,
    updatePDF_Count,
    setEveryPDF_Count_to_0,
    Check_If_There_is_pdf_in_db
} = require('../database/db');
const { displayCommands, displayBlueMessage } = require('./display_commands');

/* Function to execute the daily PDF command */
async function executeDailyPDF(interaction) {
    try {
        /* Fetch the PDFs with count 0 */
        const results = await fetchPDF_Name_with_count_0();

        /* If there are no PDFs with count 0 */
        if (results.length === 0) {
            const pdfExists = await Check_If_There_is_pdf_in_db();

            if (!pdfExists) {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('No PDFs Found')
                    .setDescription('No PDFs found in the database.')
                    .setTimestamp()
                    .setFooter({ text: 'Daily PDF Command', iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' });

                /* Log the command usage */
                displayCommands("Daily PDF", interaction, 1);
                displayBlueMessage("No PDFs found in the database.\n\n");

                await interaction.reply({ content: '@everyone', embeds: [embed] });
                return;
            }

            /* Set every PDF count to 0 */
            const setted = await setEveryPDF_Count_to_0();

            if (!setted) {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Error')
                    .setDescription('Error setting counts to 0.')
                    .setTimestamp()
                    .setFooter({ text: 'Daily PDF Command', iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' });

                /* Log the command usage */
                displayCommands("Daily PDF", interaction, 1);
                displayBlueMessage("Error setting counts to 0.\n\n");

                await interaction.reply({ content: '@everyone', embeds: [embed] });
                return;
            }

            /* Fetch the PDFs with count 0 */
            const updatedResults = await fetchPDF_Name_with_count_0();

            /* If there are no PDFs with count 0 */
            if (updatedResults.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('No PDFs Found')
                    .setDescription('No PDFs found in the database after resetting counts.')
                    .setTimestamp()
                    .setFooter({ text: 'Daily PDF Command', iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' });

                /* Log the command usage */
                displayCommands("Daily PDF", interaction, 1);
                displayBlueMessage("No PDFs found in the database after resetting counts.\n\n");
                await interaction.reply({ content: '@everyone', embeds: [embed] });
                return;
            }

            /* If there are PDFs with count 0 */
            const randomPDF = updatedResults[Math.floor(Math.random() * updatedResults.length)];
            await updatePDF_Count(randomPDF.name);

            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Daily PDF')
                .setDescription(`The daily PDF is: **${randomPDF.name}**`)
                .addFields({ name: 'Link', value: `[Click here to view](${randomPDF.link})`, inline: false })
                .setTimestamp()
                .setFooter({ text: 'Daily PDF Command', iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' })
                .setThumbnail('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'); // Thumbnail for visual enhancement

            /* Log the command usage */
            displayCommands("Daily PDF", interaction, 1);
            const now = new Date();
            displayBlueMessage("The commands were executed at: ", now, "\n\n");
            displayBlueMessage("The daily PDF is: ", randomPDF.name, "\n\n");

            await interaction.reply({ content: '@everyone', embeds: [embed] });
            return;
        }

        /* If there are PDFs with count 0 */
        const randomPDF = results[Math.floor(Math.random() * results.length)];
        await updatePDF_Count(randomPDF.name);

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Daily PDF')
            .setDescription(`The daily PDF is: **${randomPDF.name}**`)
            .addFields({ name: 'Link', value: `[Click here to view](${randomPDF.link})`, inline: false })
            .setTimestamp()
            .setFooter({ text: 'Daily PDF Command', iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' })
            .setThumbnail('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'); // Thumbnail for visual enhancement

        /* Log the command usage */
        displayCommands("Daily PDF", interaction, 1);
        const now = new Date();
        displayBlueMessage("The commands were executed at: ", now, "");
        displayBlueMessage("The daily PDF is: ", randomPDF.name, "\n\n");
        await interaction.reply({ content: '@everyone', embeds: [embed] });
    } catch (error) {
        console.error(error);

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('Error')
            .setDescription('Error fetching data from the database.')
            .setTimestamp()
            .setFooter({ text: 'Daily PDF Command', iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' });

        await interaction.reply({ content: '@everyone', embeds: [embed], ephemeral: true });
    }
}

/* Function to schedule the daily PDF command */
async function DailyPDF_Scheduler(client) {
    const now = new Date();
    const hours = now.getHours();

    /* If the daily PDF feature is active and the time is between 8 AM and 9 AM */
    if (client.dailyPDFActive && hours >= 1 && hours < 2) {
        const command = client.commands.get('turn_on_daily_pdf');
        if (command) {
            /* fakeInteraction is an object that mimics the interaction object */
            const channel = client.channels.cache.get(process.env.CHANNEL_ID);
            if (!channel) {
                console.error('Channel not found!');
                return;
            }

            const fakeInteraction = {
                client,
                commandName: 'turn_on_daily_pdf',
                channel: channel,
                reply: async (message) => {
                    fakeInteraction.channel.send(message);
                }
            };

            try {
                /* Execute the daily PDF command */
                await executeDailyPDF(fakeInteraction);
            } catch (error) {
                console.error('Error executing daily PDF command:', error);
            }
        }
    }
}

module.exports = { executeDailyPDF, DailyPDF_Scheduler };
