/*
    This function is used to display error message in console.
    @param {string} post - The message to be displayed before the error message.
    @param {string} error - The error message to be displayed.
*/

async function display_error_message(post , error) {
    const { red } = (await import('chalk')).default;
    console.log(
        red.bold('⚠️🚨 Error ! 🚨⚠️')
    );
    console.error(post + error);
    console.log('\n\n');
}

module.exports = { display_error_message };