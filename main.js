/*** IMPORT ****/
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { DailyPDF_Scheduler } = require('./helper/executeDailyPDF');
const { display_header } = require('./helper/display_header');
const { displayConnectionStatus } = require('./helper/displayConnectionStatus');
const { display_error_message } = require('./helper/display_error_message');
const { daily_problem } = require('./leetcode/daily_problem');
const { dailyRecap } = require('./leetcode/daily_recap');

/* Create a new client */
const client = new Client({

    /* Intents - Admins*/
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions
    ],
    /* Partials are used to get the full message content */
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

/* Set the commands property on the client */
client.commands = new Collection();
client.dailyPDFActive = (process.env.DAILY_PDF_ACTIVE === 'true');
client.dailyLeetcodeActive = (process.env.DAILY_LEETCODE_ACTIVE === 'true');
client.dailyLeetcodeRecapActive = (process.env.DAILY_LEETCODE_RECAP_ACTIVE === 'true');

/* Read the command files */
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

/* Loop through the command files */
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}


/* When the client is ready, init it */
client.once('ready', () => {
    display_header();
    displayConnectionStatus(client);
    schedule.scheduleJob('0 * * * *', async () => {
        await dailyRecap(client);
        await DailyPDF_Scheduler(client);
        await daily_problem(client);
    });
});

/* When the client receives an interaction */
client.on('interactionCreate', async interaction => {

    /* If the interaction is not a command, return */
    if (!interaction.isCommand()) return;

    /* Get the command */
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        /* Execute the command */
        await command.execute(interaction);
    } catch (error) {
        display_error_message('Error executing command: ', error);   
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

/* Login to the client */
const loginWithRetry = async (client, token, retries = 10, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await client.login(token);
            return;
        } catch (error) {
            if (error.code === 'EAI_AGAIN') {
                display_error_message('DNS resolution error. Retrying...');
            } else {
                display_error_message(`Login attempt ${i + 1} failed: ${error.message}`);
            }
            if (i === retries - 1) {
                display_error_message('Failed to login after multiple attempts', error);
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

loginWithRetry(client, process.env.DISCORD_TOKEN);