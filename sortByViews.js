const fs = require('fs');

function compare(a, b) {
    //work for a
    let aViews = a.views;
    let lastCharA = aViews.charAt(aViews.length - 1);
    let viewCountA = parseFloat(aViews.replace(/[^\d\.]*/g, ''));
    if (lastCharA == 'k' || lastCharA == 'K') {
        aViews = viewCountA * 1000;
    } else if (lastCharA == 'm' || lastCharA == 'M') {
        aViews = viewCountA * 1000000;
    } else if (lastCharA == 'b' || lastCharA == 'B') {
        aViews = viewCountA * 1000000000;
    }

    //work for b
    let bViews = b.views;
    let lastCharB = bViews.charAt(bViews.length - 1);
    let viewCountB = parseFloat(bViews.replace(/[^\d\.]*/g, ''));
    if (lastCharB == 'k' || lastCharB == 'K') {
        bViews = viewCountB * 1000;
    } else if (lastCharB == 'm' || lastCharB == 'M') {
        bViews = viewCountB * 1000000;
    } else if (lastCharB == 'b' || lastCharB == 'B') {
        bViews = viewCountB * 1000000000;
    }

    if (aViews <= bViews) {
        return order == 'asc' ? -1 : 1;
    } else if (aViews > bViews) {
        return order == 'asc' ? 1 : -1;
    }
}


let order;
function sortByViews(data, orderInput, doc) {
    order = orderInput;
    data.sort(compare);
    doc.pipe(fs.createWriteStream(`${__dirname}/output.pdf`));
    for (let i = 0; i < data.length; ++i) {
        let obj = data[i];
        let sNo = obj.serialNo;
        let title = obj.videoTitle;
        let duration = obj.finalDuration;
        let views = obj.views;
        doc.font(`${__dirname}\\fonts\\Louis George Cafe.ttf`).fontSize(15).text(`${sNo}) ${title} (${duration}) [${views}]`).moveDown(0.4);
        doc.lineTo(0, doc.page.width)
            .stroke();
    }
}

module.exports = {
    sortByViews
}