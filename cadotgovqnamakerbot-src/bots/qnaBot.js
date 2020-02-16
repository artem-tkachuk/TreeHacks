// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
const { MicrosoftTranslator } = require('../translation/microsoftTranslator');

const MStranslator = new MicrosoftTranslator(process.env.TRANSLATOR_TEXT_SUBSCRIPTION_KEY);
/**
 * A simple bot that responds to utterances with answers from QnA Maker.
 * If an answer is not found for an utterance, the bot responds with help.
 */
class QnABot extends ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     * @param {Object} languagePreferenceProperty Accessor for language preference property in the user state.
     */
    constructor(conversationState, userState, dialog, languagePreferenceProperty) {
        super();
        if (!conversationState) throw new Error('[QnABot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[QnABot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[QnABot]: Missing parameter. dialog is required');

        if (!languagePreferenceProperty) {
            throw new Error('[MultilingualBot]: Missing parameter. languagePreferenceProperty is required');
        }

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.languagePreferenceProperty = languagePreferenceProperty;

        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.');

            [context.activity.text, context.activity.language] = await MStranslator.translate(context.activity.text, 'en');

            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // If a new user is added to the conversation, send them a greeting message
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Welcome to the QnA Maker sample! Ask me a question and I will try to answer it.');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.QnABot = QnABot;
