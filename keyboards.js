import Markup from 'telegraf/markup.js'

export function getMainMenu() {
    return Markup.keyboard([
        ['Start to send', 'Stop posting'],
        [ 'Chat id', 'Site', 'Time between posts', 'Type of Media'],
    ]).resize().extra()
}

export function askAgainYesNo() {
    return Markup.inlineKeyboard([
        Markup.callbackButton('Send', 'true'),
        Markup.callbackButton('Don\'t send', 'false')
            // Markup.callbackButton('Don\'t send', 'false')
    ], {columns: 2}).extra()
}