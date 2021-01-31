'use strict'

import express from 'express';
import Telegraf from 'telegraf';
import {PORT, TOKEN} from './config.js';
import ScrapeMedia from './forward.js';
import {getMainMenu, askAgainYesNo} from './keyboards.js';

const telegramBot = express();

const bot = new Telegraf(TOKEN);

class ForwardBot {
    static site = 'https://9gag.com/fresh';// By default from this site
    static #chatId;
    static timeBetweenPosts = 5; // It will post every 5 munutes
    static typeMedia = 'photo'; // default media

    static async getUrl(callback) {
        const postSession = new ScrapeMedia(this.site, this.typeMedia);
        const urlOfMedia = await postSession.defineSite();
        callback(urlOfMedia);
    }

    static callBot() {
        let _sending;

        bot.start(ctx => {
            ctx.replyWithHTML('Welcome to the <b>ForwardBot</b>\n' +
                `Hi to use you need:\n
        1)Add bot to group as admin\n
        2)Write chat id(\/chatId looks as: -1001328909412)\n
        3)Enjoy free time`, getMainMenu());
        });

        bot.hears(/\/chatId|Chat id/, ctx =>
            ctx.reply('Chat id:')
        );

        bot.hears(/\/site|Site/, ctx =>
            ctx.reply('Site:')
        );

        bot.hears(/\/interval|Time between posts/,ctx => {
            ctx.reply(`During what time I must post?\n
        From 5 minutes till 720 minutes(12 hours).\n
        For instance, if you want that I post every hour simply type: 60\n
        In minutes:`);
        })

        bot.hears(/\/type|Type of Media/, ctx =>
            ctx.reply('Type of Media(photo or video):')
        );

        bot.hears(/\/send|\/stop|Stop posting|Start to send/, ctx=> {
            if (_sending)
                clearInterval(_sending);

            if (!this.#chatId || !this.site)
                ctx.reply(`Please write a \'${this.#chatId ? 'Site' : 'Chat id'}\'! I don\'t know ${this.#chatId ? 'where I should take a media' : 'in what chat send a picture'}`);
            else if (/\/send|Start to send/.test(ctx.update.message.text))
                ctx.reply('Send?', askAgainYesNo());
            else if (/\/stop|Stop posting/.test(ctx.update.message.text))
                ctx.reply('Stopping!');
        });

        bot.on('text', ctx =>
            this.replyAnyText(ctx)
        );

        bot.action(['true', 'false'], ctx => {
            if (ctx.callbackQuery.data) {
                this.sendPost(ctx);
                _sending = setInterval(() =>
                    this.sendPost(ctx)
                , this.timeBetweenPosts * 60000);
                ctx.editMessageText('Sending!!!');
            } else ctx.deleteMessage();
        })

        bot.launch();
        telegramBot.listen(PORT, () => console.log(`Local server with port: ${PORT}`));
    }

    static sendPost(ctx) {
        this.getUrl((urlCallback) => {
            ctx.telegram[`send${this.typeMedia.toUpperCase().slice(0, 1)}${this.typeMedia.slice(1)}`](this.#chatId, {
                url: urlCallback
            });
            ctx.reply('Send!');
        });
    }

    static replyAnyText(ctx) {
        let msg = ctx.update.message.text;
        if (/^-[0-9]{13}$/.test(msg)) {
            this.#chatId = msg;
            ctx.reply('Okeyyyy. Looks correct!');
        } else if (/^https?:\/\//.test(msg) && msg.length > 9) {
            this.site = msg;
            ctx.reply(`Yeah, I add this site!`);
        } else if (/^[0-9]{1,3}$/.test(msg) && msg >= 5 && msg <= 720 ) {
            this.timeBetweenPosts = msg;
            ctx.reply(`I will post every ${msg} minutes!`);
        }else if (/^video|photo$/.test(msg)) {
            this.typeMedia = msg;
            ctx.reply(`I will post some ${this.typeMedia} every ${this.timeBetweenPosts} minutes!`);
        } else ctx.reply('Sorry but you don\'t write right!?');
    }
}

ForwardBot.callBot();