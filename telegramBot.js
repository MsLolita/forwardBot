'use strict'

import express from 'express';
import Telegraf from 'telegraf';
import {PORT, TOKEN} from './config.js';
import ScrapeMedia from './forward.js';
import {getMainMenu, askAgainYesNo} from './keyboards.js';

const telegramBot = express();

const bot = new Telegraf(TOKEN);

class ForwardBot {
    static site;
    static #chatId;
    static timeBetweenPosts = 5;
    static typeMedia;

    static async getUrl(callback) {
        const postSession = new ScrapeMedia(this.site, this.typeMedia);
        const urlOfMedia = await postSession.defineSite(this.site);
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

        bot.hears(/\/chatId|Write chat id/, ctx=> {
            ctx.reply('Chat id:');
        });

        bot.hears(/\/interval|Write time between posts/,ctx => {
            ctx.reply(`During what time I must post?\n
        From 5 minutes till 720 minutes(12 hours).\n
        For instance, if you want that I post every hour simply type: 60\n
        In minutes: `);
        })

        bot.hears(/\/site|Write a site/, ctx=> {
            ctx.reply('Site:');
        });

        bot.hears(/\/send|\/stop|Stop posting|Start to send/, ctx=> {
            (!this.#chatId ? ctx.reply('chatId is empty! I don\'t know in what chat send a picture' ) : true);
            if (_sending) {
                clearInterval(_sending);
            }

            if (/\/send|Start to send/.test(ctx.update.message.text) && this.#chatId ) {
                ctx.reply('Send?', askAgainYesNo());
            } else if (/\/stop|Stop posting/.test(ctx.update.message.text)) {
                ctx.reply('Stopping!');
            }
        });

        bot.on('text', ctx =>{
            this.replyAnyText(ctx);
        });

        bot.action(['true', 'false'], ctx => {
            if (ctx.callbackQuery.data === 'true') {
                this.sendPost(ctx);
                _sending = setInterval(() => {
                    this.sendPost(ctx);
                }, this.timeBetweenPosts * 60000);
                ctx.editMessageText('Sending!!!');
            } else {
                ctx.deleteMessage();
            }
        })

        bot.launch();
        telegramBot.listen(PORT, () => console.log(`Local server with port: ${PORT}`));
    }

    static sendPost(ctx) {
        this.getUrl((urlCallback) => {
            console.log(urlCallback)
            ctx.telegram[`send${this.typeMedia.toUpperCase().slice(0, 1)}${this.typeMedia.slice(1)}`](this.#chatId, {
                url: urlCallback
            }, {
                caption: "Funny Video"
            });
            ctx.reply('Send!');
        });
    }

    static replyAnyText(ctx) {
        let msg = ctx.update.message.text;
        if (/^-[0-9]{13}$/.test(msg)) {
            this.#chatId = msg;
            ctx.reply('Okeyyyy. Looks correct!');
        } else if (/^[0-9]{1,3}$/.test(msg) && msg >= 5 && msg <= 720 ){
            this.timeBetweenPosts = msg;
            ctx.reply(`I will post every ${msg} minutes!`);
        }else ctx.reply('Sorry but you don\'t write right!?');
    }
}

ForwardBot.callBot();