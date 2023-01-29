const fs = require('fs');

function compare(a, b) {
    if (a.finalDuration <= b.finalDuration) {
        return order == 'inc' ? -1 : 1;
    } else if (a.finalDuration > b.finalDuration) {
        return order == 'inc' ? 1 : -1;
    }
}

let order;
function sortByDuration(data, orderInput, doc) {
    order = orderInput;
    data.sort(compare);
    doc.pipe(fs.createWriteStream(`${__dirname}/output.pdf`));
    for (let i = 0; i < data.length; ++i) {
        let obj = data[i];
        let sNo = obj.serialNo;
        let title = obj.videoTitle;
        let duration = obj.finalDuration;
        doc.font(`${__dirname}\\fonts\\Louis George Cafe.ttf`).fontSize(15).text(`${sNo}) ${title} (${duration})`).moveDown(0.4);
        doc.lineTo(0, doc.page.width)
            .stroke();
    }
}

module.exports = {
    sortByDuration
}