// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required packages
const path = require('path');
const request = require('request');
const uuidv4 = require('uuid/v4')
const restify = require('restify');
const { MicrosoftTranslator } = require('./translation/microsoftTranslator');
const { TranslatorMiddleware } = require('./translation/translatorMiddleware');
const LANGUAGE_PREFERENCE = 'language_preference';


// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');

const { QnABot } = require('./bots/qnaBot');
const { RootDialog } = require('./dialogs/rootDialog');

// Note: Ensure you have a .env file and include QnAMakerKnowledgeBaseId, QnAMakerEndpointKey and QnAMakerHost.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    let onTurnErrorMessage = 'The bot encounted an error or bug.';
    await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);
    onTurnErrorMessage = 'To continue to run this bot, please fix the bot source code.';
    await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);
    // Clear out state
    await conversationState.delete(context);
};

// Define the state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state storage system to persist the dialog and user state between messages.
const memoryStorage = new MemoryStorage();

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const languagePreferenceProperty = userState.createProperty(LANGUAGE_PREFERENCE);

const translator = new MicrosoftTranslator(process.env.TRANSLATOR_TEXT_SUBSCRIPTION_KEY);
adapter.use(new TranslatorMiddleware(translator, languagePreferenceProperty));

var endpointHostName = process.env.QnAEndpointHostName;
if (!endpointHostName.startsWith('https://')) {
    endpointHostName = 'https://' + endpointHostName;
}

if (!endpointHostName.endsWith('/qnamaker')) {
    endpointHostName = endpointHostName + '/qnamaker';
}

const qnaService = new QnAMaker({
    knowledgeBaseId: process.env.QnAKnowledgebaseId,
    endpointKey: process.env.QnAAuthKey,
    host: endpointHostName
});

// Create the main dialog.
const dialog = new RootDialog(qnaService);

// Create the bot's main handler.
const bot = new QnABot(conversationState, userState, dialog, languagePreferenceProperty);

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (turnContext) => {
        await bot.run(turnContext);
    });
});