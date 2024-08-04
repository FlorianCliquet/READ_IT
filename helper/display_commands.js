/* 
    This file contains the functions that are used to display the commands used by the user
    and the messages that are displayed to the user in the terminal.
    @param {string} commands_Name - The name of the command used by the user.
    @param {string} user - The user who used the command.
    @param {number} type - The type of the demand. (0) if the command is used by the user, (1) if the command is used by the bot.
*/

async function displayCommands(commands_Name, user, type) {
    const { bgGreen, black, white, blue } = (await import('chalk')).default;
    const commandLine = `${bgGreen.black.bold(`🤖 Command used : ${white.bold(commands_Name)} 🤖`)}`;
    const userLine = type === 0 ? `Used by: ${blue.bold(user)}` : '';
    console.log(commandLine);
    if (userLine) {
        console.log(userLine);
    }    
}

async function displayBlueMessage(before, message, after) {
    const { blue } = (await import('chalk')).default;
    console.log(
        before + 
        blue.bold(message)
        + after
    );
}

module.exports = { displayCommands, displayBlueMessage };
