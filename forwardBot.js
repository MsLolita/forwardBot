'use strict'

const puppeteer = require("puppeteer");

const TelegramBot = require('node-telegram-bot-api');
const token = '1498795537:AAGBR6zpViicla92Pck7OCk93AoDSbrGprE';
const bot = new TelegramBot(token, { polling: true });

async function forwarBot () {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        // args: ["--start-maximized"]
    });
    let page =  await browser.newPage();
    const pageURL = 'https://9gag.com/funny/fresh';

    try {
        await page.goto(pageURL);
    } catch (error) {
        console.log(`I can't open: ${pageURL} due to this mistake: ${error}`);
    }
    await page.waitFor(500);

    const resultedUrl = await page.evaluate(() => {
        let url = document.querySelector("div.post-container picture img", { waitUntil: 'domcontentloaded' }).src;
        return url;
    });

    //await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })


    browser.close();
    return resultedUrl;
};
forwarBot().then((value) => {
    let chatId;
    bot.onText(/\/info|\/start/, function (msg) {
        let userId = msg.from.id;
        bot.sendMessage(userId, `Hi to use you need:\n
        1)Add bot to group as admin\n
        2)Write chat id(\/chatId -183123783284)\n
        3)Enjoy free time`);});
    bot.onText(/\/chatId (.+)/, function (msg, match) {
        let userId = msg.from.id;
        chatId = match[1];
        if (chatId.match(/-[0-9]{13}/))
            bot.sendMessage(userId, 'Okeyyyy. Looks correct!');
        else bot.sendMessage(userId, 'Not right expression!!!');
    });
    bot.onText(/\/pic/, function (msg) {
        bot.sendPhoto(chatId, value, { caption: '\nNot bad Pictures' });
    });
})
    //-1001328909412