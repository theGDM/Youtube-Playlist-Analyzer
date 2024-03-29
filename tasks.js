const puppeteer = require('puppeteer'); //importing the puppeteer
const PDFDocument = require('pdfkit');
const { calculate } = require('./totalWatchTime');
const { normalOrder } = require('./normalOrder.js');
const { sortByTitle } = require('./sortByTitle.js');
const { sortByDuration } = require('./sortByDuration.js');
const { sortByViews } = require('./sortByViews.js');
const fs = require('fs');

let cTab;
async function tasks(linKOfPL) {
    let args = Array.from(arguments);
    try {
        let browserOpen = puppeteer.launch({ //it will return the promise
            headless: false, //by default puppetear works on headless(visibility ka na hona hi) //now a browser will open(chromium browser) this brwoser is used for testing purpose
            defaultViewport: null, //we don't want the default browser size set by the google
            args: ['--start-maximized'] //open the site in full screen(full screen)
        });

        let browserInstance = await browserOpen; //it will oepn the new tab
        let allTabsArr = await browserInstance.pages(); //it will return array of all opened tabs

        cTab = allTabsArr[0];
        await cTab.goto(linKOfPL);
        let name = await cTab.evaluate(function (select) {
            return document.querySelector(select)?.innerText;
        }, '.style-scope.yt-dynamic-sizing-formatted-string.yt-sans-20'); //2nd argument is actually the argument to the function which the first argument

        //getting the stats of the playlist
        let totalVideos = await cTab.evaluate(getTotalVideos, '.byline-item.style-scope.ytd-playlist-byline-renderer > span:first-child');
        totalVideos = parseInt(totalVideos);
        let totalViews = await cTab.evaluate(getTotalViews, '.metadata-stats.style-scope.ytd-playlist-byline-renderer .byline-item');
        let currVideosInOneScroll = await getCurrVideosLen();

        while (totalVideos - currVideosInOneScroll >= 1) {
            await scrollToBottom();
            currVideosInOneScroll = await getCurrVideosLen();
        }

        // Pdf related task
        let finalList = await getStats();
        let ans = calculate(finalList);
        // Create a document
        const doc = new PDFDocument();
        // Pipe its output somewhere, like to a file or HTTP response
        doc.pipe(fs.createWriteStream(`${__dirname}/output.pdf`));

        // Add an image, constrain it to a given size, and center it vertically and horizontally
        doc.image(`${__dirname}\\images\\YTLogo.png`, 0, 15, { height: 200 }); //stretch

        doc.font(`${__dirname}\\fonts\\AmericanCaptain-MdEY.otf`).fontSize(30).text(name, 72, 220).moveDown(0.5);

        if (args[1] == 'title') {
            sortByTitle(finalList, args[2], doc);
        } else if (args[1] == 'duration') {
            sortByDuration(finalList, args[2], doc);
        } else if (args[1] == 'views') {
            sortByViews(finalList, args[2], doc);
        } else {
            normalOrder(finalList, doc);
        }

        //append calculation like total no of videos, total watch time, no of views till now
        doc.font(`${__dirname}\\fonts\\EnceladusDemibold-mL18a.otf`).fontSize(20).text(`Total Videos : ${totalVideos}`).moveDown(0.1);
        doc.font(`${__dirname}\\fonts\\EnceladusDemibold-mL18a.otf`).fontSize(20).text(`Total Views : ${totalViews}`).moveDown(0.1);
        doc.font(`${__dirname}\\fonts\\EnceladusDemibold-mL18a.otf`).fontSize(20).text(`Total Time to Finish Playlist : ${ans}`).moveDown(0.1);

        // Finalize PDF file
        doc.end();
    } catch (error) {
        console.log(error);
    }
};

function getTotalVideos(selector) {
    return document.querySelector(selector)?.innerText;
}

function getTotalViews(selector) {
    let views = document.querySelectorAll(selector)[1]?.innerText;
    return views;
}

async function getCurrVideosLen() {
    let length = await cTab.evaluate(getLength, '#contents ytd-playlist-video-renderer .yt-simple-endpoint.inline-block.style-scope.ytd-thumbnail');
    return length;
}

//the array that we get of videos in one scroll
function getLength(durationSelect) {
    let durationElement = document.querySelectorAll(durationSelect);
    return durationElement.length;
}

async function scrollToBottom() {
    await cTab.evaluate(goToBottom);
    function goToBottom() {
        window.scrollBy(0, window.innerHeight);
    }
}

async function getStats() {
    let list = await cTab.evaluate(getNameAndDuration, 'ytd-playlist-video-renderer #video-title', 'ytd-playlist-video-renderer #thumbnail #overlays #text', '#metadata #video-info');
    return list;
}

async function getNameAndDuration(videoSelector, durationSelector, viewsSelector) {
    let videoElement = document.querySelectorAll(videoSelector);
    let durationElement = document.querySelectorAll(durationSelector);
    let viewsElement = document.querySelectorAll(viewsSelector);

    let currentList = [];
    for (let i = 0; i < durationElement.length; ++i) {
        let serialNo = i + 1;
        let videoTitle = videoElement[i]?.innerText;
        let duration = durationElement[i]?.innerText;
        let views = viewsElement[i].querySelectorAll('span')[0]?.innerText;

        duration = duration.split(/\r?\n/);
        let finalDuration;
        if (duration.length > 1) {
            finalDuration = duration[1].trim();
        } else {
            finalDuration = duration[0];
        }

        views = views.split(' ')[0];
        currentList.push({
            serialNo,
            videoTitle,
            finalDuration,
            views
        })
    }

    return currentList; //array of objects
}

module.exports = {
    tasks
}