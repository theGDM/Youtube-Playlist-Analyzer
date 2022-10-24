const puppeteer = require('puppeteer'); //importing the puppeteer
const PDFDocument = require('pdfkit');
const { calculate } = require('./totalWatchTime');

const fs = require('fs');

let cTab;
let inputArr = process.argv.slice(2); //slice from 2nd index to end

let linKOfPL = inputArr[0];
(async function () {
    try {
        let browserOpen = puppeteer.launch({ //it will return the promise
            headless: false, //by default puppetear works on headless(visibility ka na hona hi) //now a browser will open(chromium browser) this brwoser is used for testing purpose
            defaultViewport: null, //we don't want the default browser size set by the google
            args: ['--start-maximized'] //open the site in full screen(full screen)
        });

        let brwserInstance = await browserOpen; //it will oepn the new tab
        let allTabsArr = await brwserInstance.pages(); //it will return array of all opened tabs

        cTab = allTabsArr[0];
        await cTab.goto(linKOfPL);
        let name = await cTab.evaluate(function (select) {
            return document.querySelector(select).innerText;
        }, '#items #title a'); //2nd argument is actually the argument to the function which the first argument

        //getting the stats of the playlist
        let stats = await cTab.evaluate(getData, 'div#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer');
        let totalVideos = parseInt(stats.noOfVideos.split(" ")[0]);
        let totalViews = stats.noOfViews.split(" ")[0];

        let currVideosInOneScroll = await getCurrVideosLen();

        while (totalVideos - currVideosInOneScroll >= 1) {
            await scrollToBottom()
            currVideosInOneScroll = await getCurrVideosLen();
        }

        //Pdf related task
        let finalList = await getStats();
        let ans = calculate(finalList);
        // Create a document
        const doc = new PDFDocument();
        // Pipe its output somewhere, like to a file or HTTP response
        doc.pipe(fs.createWriteStream(`${__dirname}/output.pdf`));

        // Add an image, constrain it to a given size, and center it vertically and horizontally
        doc.image(`${__dirname}\\images\\YTLogo.png`, 0, 15, { height: 200 }); //stretch

        doc.font(`${__dirname}\\fonts\\AmericanCaptain-MdEY.otf`).fontSize(30).text(name, 72, 220).moveDown(0.5);
        doc.font(`${__dirname}\\fonts\\Louis George Cafe.ttf`).fontSize(15).text(JSON.stringify(finalList)).moveDown(0.4);


        //append calculation like total no of videos, total watch time, no of views till now
        doc.font(`${__dirname}\\fonts\\EnceladusDemibold-mL18a.otf`).fontSize(20).text(`Total Videos : ${totalVideos}`).moveDown(0.1);
        doc.font(`${__dirname}\\fonts\\EnceladusDemibold-mL18a.otf`).fontSize(20).text(`Total Views : ${totalViews}`).moveDown(0.1);
        doc.font(`${__dirname}\\fonts\\EnceladusDemibold-mL18a.otf`).fontSize(20).text(`Total Time to Finish Playlist : ${ans}`).moveDown(0.1);

        // Finalize PDF file
        doc.end();
    } catch (error) {
        console.log(error);
    }
})();

function getData(selector) {
    let allElemets = document.querySelectorAll(selector);
    let noOfVideos = allElemets[0].innerText;
    let noOfViews = allElemets[1].innerText;

    return {
        noOfVideos,
        noOfViews
    }
}

async function getCurrVideosLen() {
    let length = await cTab.evaluate(getLength, '#container > #thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer');
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
    let list = await cTab.evaluate(getNameAndDuration, 'ytd-playlist-video-renderer  #video-title', '.style-scope.ytd-section-list-renderer #thumbnail #overlays #text');
    return list;
}

function getNameAndDuration(videoSelector, durationSelector) {
    let videoElement = document.querySelectorAll(videoSelector);
    let durationElement = document.querySelectorAll(durationSelector);

    let currentList = [];
    for (let i = 0; i < durationElement.length; ++i) {
        let serialNo = i + 1;
        let videoTitle = videoElement[i].innerText;
        let duration = durationElement[i].innerText;

        currentList.push({
            serialNo,
            videoTitle,
            duration
        })
    }

    return currentList; //array of objects
}