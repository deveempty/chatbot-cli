import openai from './config/openai.js';
import readLineSync from 'readline-sync';
import colors from 'colors';

const main = async () => {
    console.log(colors.bold.green('Welcome to the Chatbot Program!'))
    console.log(colors.bold.green('You can start chatting with the bot'))
    
    let userName = '';
    while (true) {
        userName = readLineSync.question('Before start... What is your name?: ')
        if (userName.toLowerCase() === 'exit') return; //return when "exit" is typed on name question
        if (userName.trim() !== '') break; // if name is empty, we get out of bucle and send error message below
        console.log(colors.bold.red("You need to provide a name..."));
    }

    const chatHistory = [];

    // Define loadingInterval here, outside of the try/catch block
    let loadingInterval;

    while (true) {
        const userInput = readLineSync.question(colors.bold.yellow(`${userName}: `));

        if (userInput.toLowerCase() === 'exit') {
            const messages = chatHistory.map(([role, content]) => ({role, content}));
            messages.push({role: 'user', content: 'exit'}); // exit message, to be gentle
            try {
                const chatCompletion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo', // Make sure use the text model - https://platform.openai.com/docs/models
                    messages: messages
                });
                const goodbyeMessage = chatCompletion.choices[0].message.content;
                console.log(colors.bold.blue(`ChatBot🤖: `) + goodbyeMessage);
            } catch (error) {
                console.error(colors.red("Error fetching goodbye message: "), error);
            }
            break;    
        }

        try {
            // Start the loading indicator
            loadingInterval = setInterval(() => {
                process.stdout.write(colors.bold.magenta('.'));
            }, 500);

            const messages = chatHistory.map(([role, content]) => ({role, content})) // Construct messages by iterating over the history
            messages.push({role: 'user', content: userInput}); // Later user input
            const chatCompletion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo', // Make sure use the text model - https://platform.openai.com/docs/models
                messages: messages
            });
            const botResponse = chatCompletion.choices[0].message.content;

            // Stop the loading indicator when the response is back...
            clearInterval(loadingInterval);
            process.stdout.write('\r\x1b[K'); // to clean up "..."

            console.log(colors.bold.blue(`ChatBot🤖: `) + botResponse);
            
            // Update history with user input & assistant response
            chatHistory.push(['user', userInput]);
            chatHistory.push(['assistant', botResponse]);
        } catch (error) {
            clearInterval(loadingInterval);
            process.stdout.write('\r\x1b[K');

            console.error(colors.red(error));
        }
    }
}

main();
