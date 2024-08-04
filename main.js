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

/* Create a new client */
const client = new Client({

    /* Intents - Admins*/
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],
    /* Partials are used to get the full message content */
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

/* Set the commands property on the client */
client.commands = new Collection();
client.dailyPDFActive = (process.env.DAILY_PDF_ACTIVE === 'true');

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
    schedule.scheduleJob('* * * * *', async () => {
        await DailyPDF_Scheduler(client);
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
client.login(process.env.DISCORD_TOKEN);