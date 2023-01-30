const fs = require('fs');

function compare(a, b) {
    if (a.videoTitle <= b.videoTitle) {
        return order == 'asc' ? -1 : 1;
    } else if (a.videoTitle > b.videoTitle) {
        return order == 'asc' ? 1 : -1;
    }
}

let order;
function sortByTitle(data, orderInput, doc) {
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
    sortByTitle
}
