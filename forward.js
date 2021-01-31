'use strict'

import puppeteer from "puppeteer";
import userAgent from "user-agents";

export default class ScrapeMedia {
    #start = Date.now();

    #browser;
    #page;

    constructor(site, typeMedia = "photo")  {
        this.site = site;
        this.typeMedia = typeMedia;
    }

    async defineSite() {
        let _urlMedia = '';
        switch (new URL(this.site).hostname) {
            case '9gag.com':
                return await this.getMediaGag(_urlMedia);
            case 'www.instagram.com':
                return await this.getMediaInsta(_urlMedia);
            case 'www.facebook.com':
                return await this.getMediaFb(_urlMedia);
            default:
                return 'I don\'t know how to scrape this site';
        }
    }

    async startSession() {
        this.#browser = await puppeteer.launch({
            headless: true,
            devtools: false,
        });

        this.#page = await this.#browser.newPage();

        await this.#page.setUserAgent(userAgent.toString()); // helps avoid captcha
    }

    async getMediaGag(_urlMedia) {
        const mediaSelector = `.post-container ${this.typeMedia === 'photo' ? 'img' : 'video source'}`;

        await this.startSession();
        await this.#page.goto(this.site);
        try {

            for(; !_urlMedia; await this.#page.evaluate('document.querySelector("#list-view-2 > div.loading").scrollIntoView()')){
                await Promise.all(await this.#page.$$(`${mediaSelector.slice(0, 15)}:nth-child(n+2)`));
                _urlMedia = await this.#page.evaluate( (mediaSelector) => {
                    const post = document.querySelector(mediaSelector);
                    return post && post.src;
                }, mediaSelector);
            }

        } catch (error){
            console.log("I can't find a picture due to " + error);
        }
        await this.endSession();
        return _urlMedia;
    }

    async getMediaInsta(_urlMedia) {
        this.typeMedia = this.typeMedia === 'photo' ? 'display_url' : 'video_url';

        await this.startSession();
        await this.#page.goto(this.site + '?__a=1');

        try {

            _urlMedia = this.findMediaInsta(
                await this.#page.evaluate( () => {
                    return JSON.parse(document.body.getElementsByTagName('pre')[0].innerText);
                })
            )[0];

        } catch (e) {
            console.log("I can't find a picture due to " + e);
        }

        await this.endSession();
        return _urlMedia;
    }

    async getMediaFb(_urlMedia) {
        this.typeMedia = this.typeMedia === 'photo' ? 'div.story_body_container img[style]' : 'video';

        await this.startSession();
        await this.#page.goto(this.site.replace('www', 'm'));

        try {

            if (this.typeMedia === 'video')
                await this.#page.evaluate('document.querySelector("div[data-sigil=inlineVideo] i").click()')

            _urlMedia = await this.#page.$eval(this.typeMedia, media => media.src);

        } catch (e) {
            console.log("I can't find a picture due to " + e);
        }

        await this.endSession();
        return _urlMedia;
    }

    findMediaInsta(obj, res = []) {
        for (const key in obj)
            if (typeof obj[key] !== 'string')
                this.findMediaInsta(obj[key], res);
            else if (key === this.typeMedia)
                res.push(obj[key]);
        return res;
    }

    async endSession() {
        await this.#browser.close();

        console.log('Used time:', (Date.now() - this.#start) / 1000);
    }
}
