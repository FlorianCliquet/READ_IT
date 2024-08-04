/*
    This function is used to display the connection status of the bot.
    @param {Client} client - The Discord client.
*/

async function displayConnectionStatus(client) {
    const chalk = (await import('chalk')).default;
    console.log(
        chalk.bgGreen.black.bold(`🤖 Bot Connected 🤖\n`) +
        `Connected as: ${chalk.blue.bold(client.user.tag)}`
    );
    console.log('                                                                                ');
    console.log('                                                                                ');
}

module.exports = { displayConnectionStatus };
