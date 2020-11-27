'use strict'

import express from 'express';
import { PORT, TOKEN } from './config.js';
import Telegraf from 'telegraf';
import {scrapeUrl} from './forward.js';
import {getMainMenu, askAgainYesNo} from './keyboards.js'

const telegramBot = express();

const bot = new Telegraf(TOKEN);

callBot();

let chatId,
    isChatId = false, sending,
    timeBetweenPosts = 5, url;

async function getUrl(urlCallback, callback) {
    urlCallback = await scrapeUrl();
    callback(urlCallback);
}

function callBot() {
    bot.start(ctx => {
        ctx.replyWithHTML('Welcome to the <b>ForwardBot</b>\n' +
            `Hi to use you need:\n
        1)Add bot to group as admin\n
        2)Write chat id(\/chatId looks as: -1001328909412)\n
        3)Enjoy free time`, getMainMenu());
    });

    bot.hears(/\/chatId|Write chat id/, ctx=> {
        ctx.reply('Chat id:');
        isChatId = true;
    });

    bot.hears(/\/interval|Write time between posts/,ctx => {
        ctx.reply(`During what time I must post?\n
        From 5 minutes till 720 minutes(12 hours).\n
        For instance, if you want that I post every hour simply type: 60\n
        In minutes: `);
    })

    bot.hears(/\/send|\/stop|Stop posting|Start to send/, ctx=> {
        (!chatId ? ctx.reply('chatId is empty! I don\'t know in what chat send a picture' ) : true);
        if (sending) {
            clearInterval(sending);
        };

        if (/\/send|Start to send/.test(ctx.update.message.text) && chatId ) {
            ctx.reply('Send?', askAgainYesNo());
        } else if (/\/stop|Stop posting/.test(ctx.update.message.text)) {
            ctx.reply('Stopping!');
        }
    });

    bot.on('text', ctx =>{
        replyAnyText(ctx);
    });

    bot.action(['true', 'false'], ctx => {
        if (ctx.callbackQuery.data === 'true') {
            sendPost(ctx);
            sending = setInterval(() => {
                sendPost(ctx);
            }, timeBetweenPosts * 60000);
            ctx.editMessageText('Sending!!!');
        } else {
            ctx.deleteMessage();
        }
    })

    bot.launch();
    telegramBot.listen(PORT, () => console.log(`Local server with port: ${PORT}`))
}

function sendPost(ctx) {
        getUrl(url, (urlCallback) => {
            bot.telegram.sendPhoto(chatId,
                {url: urlCallback},
                {caption: "Funny Picture"});
            ctx.reply('Send!');
            url = urlCallback;
        });
}

function replyAnyText(ctx) {
    let msg = ctx.update.message.text;
    if (/^-[0-9]{13}$/.test(msg) && isChatId) {
        chatId = msg;
        isChatId = false;
        ctx.reply('Okeyyyy. Looks correct!');
    } else if (isChatId) ctx.reply('Right chat id looks: -1234567890987');
    else if (/^[0-9]{1,3}$/.test(msg) && msg >= 5 && msg <= 720 ){
        timeBetweenPosts = msg;
        ctx.reply(`I will post every ${msg} minutes!`);
    }else ctx.reply('Sorry but you don\'t write right!?');
}