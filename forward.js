'use strict'

import puppeteer from "puppeteer";

export async function scrapeUrl() {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        // args: ["--start-maximized"]
    });
    let page =  await browser.newPage();
    const imgSelector = "#container > .page .main-wrap > #list-view-2 div.list-stream article .post-container img";
    const pageURL = 'https://9gag.com/funny/fresh';

    try {
        await page.goto(pageURL);

    } catch (error) {
        console.log(`I can't open: ${pageURL} due to this mistake: ${error}`);
    }

    await page.waitForSelector(imgSelector, { timeout: 0 });
    //await page.screenshot({path: 'google.png'});
    const pictureUrl = await page.$eval(
        imgSelector, imgSelector => imgSelector.src
    );

    // const resultedUrl = await page.evaluate(() => {
    //     let url = document.querySelector("div.post-container picture img", { waitUntil: 'domcontentloaded' }).src;
    //     return url;
    // });

    //await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })

    browser.close();
    return pictureUrl;
};

// export function hello() {
//     return "Hello";
// }

//module.exports = { forwarBot };
// let app = 123;
//
// module.exports = { app };
