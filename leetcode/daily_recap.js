const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { displayCommands, displayBlueMessage } = require('../helper/display_commands');
const { display_error_message } = require('../helper/display_error_message');
const { fetch_leetcode_accounts } = require('../database/db');

let apiURL;
let leetcodeurl = "https://leetcode.com/u/";
try {
    const configPath = path.resolve(__dirname, '../config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    apiURL = config.API_LEETCODE_ACCOUNT;
} catch (error) {
    console.error('Error reading config file:', error);
}

async function executeDailyRecap(interaction) {
    const allAccounts = await fetch_leetcode_accounts();
    for (const account of allAccounts) {
        displayBlueMessage("Account: ", account.name, "\n");
        const maxRetries = 5;
        let attempt = 0;
        let success = false;
        let accountName = account.name;
        let discordUserId = account.id;

        while (attempt < maxRetries && !success) {
            try {
                const url = `${apiURL}/${accountName}`;
                const leetcodeUrl = `${leetcodeurl}${accountName}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                // Determine the start and end of today's date in Unix timestamp format
                const now = new Date();
                const startOfDay = new Date(now.setHours(0, 0, 0, 0)).getTime() / 1000;
                const endOfDay = new Date(now.setHours(23, 59, 59, 999)).getTime() / 1000;

                // Filter today's submissions
                const todaySubmissions = data.recentSubmissions.filter(submission => {
                    return submission.timestamp >= startOfDay && submission.timestamp <= endOfDay;
                });

                // Create embed
                const embed = new EmbedBuilder()
                    .setColor('#FF6F00') // A vibrant orange for emphasis
                    .setTitle(`📈 Daily Leetcode Recap for ${accountName}`)
                    .setURL(data.link)
                    .setDescription(`[View your Leetcode profile here](${leetcodeUrl})`)
                    .setThumbnail('https://example.com/leetcode-logo.png') // Replace with actual URL
                    .setTimestamp()
                    .setFooter({ text: 'Leetcode Daily Recap', iconURL: 'https://example.com/leetcode-logo.png' }); // Footer with the logo

                // Add fields
                embed.addFields(
                    { name: '🗂 Total Problems Solved', value: data.totalSolved.toString(), inline: true },
                    { name: '🟢 Easy Problems Solved', value: data.easySolved.toString(), inline: true },
                    { name: '🟡 Medium Problems Solved', value: data.mediumSolved.toString(), inline: true },
                    { name: '🔴 Hard Problems Solved', value: data.hardSolved.toString(), inline: true },
                    { name: '🏆 Ranking', value: data.ranking.toString(), inline: true },
                    { name: '⭐ Total Contribution Points', value: data.contributionPoint.toString(), inline: true }
                );

                // Add today's submissions
                if (todaySubmissions.length > 0) {
                    const recentSubmissions = todaySubmissions.map(sub => {
                        return `**${sub.title}** (${sub.lang}) - *${sub.statusDisplay}*`;
                    }).join('\n');

                    embed.addFields({ name: '📚 Today\'s Submissions', value: recentSubmissions, inline: false });
                } else {
                    embed.addFields({ name: '📚 Today\'s Submissions', value: 'No submissions today.', inline: false });
                }

                // Ping the user with the recap
                await interaction.reply({ content: `<@${discordUserId}>`, embeds: [embed] });

                success = true; // Mark as success
            } catch (error) {
                attempt++;
                if (attempt === maxRetries) {
                    display_error_message('Error executing command: ', error);
                    await interaction.reply('There was an error while executing this command!');
                } else {
                    displayBlueMessage('Error fetching data. Retrying... (Attempt ', `${attempt}/${maxRetries}`, ')');
                }
            }
        }
    }
}

async function dailyRecap(client) {
    const now = new Date();
    const hours = now.getHours();

    if (client.dailyLeetcodeRecapActive && hours >= 20 && hours < 21) {
        displayCommands("Leetcode Recap")
        const command = client.commands.get('turn_on_daily_leetcode_recap');
        if (command) {
            const channel = client.channels.cache.get(process.env.CHANNEL_LEETCODE_RECAP_ID);
            if (!channel) {
                console.error('Channel not found!');
                return;
            }

            const fakeInteraction = {
                client,
                commandName: 'turn_on_daily_leetcode',
                channel: channel,
                reply: async (message) => {
                    fakeInteraction.channel.send(message);
                }
            };

            try {
                await executeDailyRecap(fakeInteraction);
            } catch (error) {
                console.error('Error executing daily Leetcode command:', error);
            }
        }
    }
}

module.exports = { dailyRecap };
