const fs = require('fs');

function normalOrder(data, doc) {
    doc.pipe(fs.createWriteStream(`${__dirname}/output.pdf`));
    for (let i = 0; i < data.length; ++i) {
        let obj = data[i];
        let title = obj.videoTitle;
        let duration = obj.finalDuration;
        doc.font(`${__dirname}\\fonts\\Louis George Cafe.ttf`).fontSize(15).text(`${i + 1}) ${title} (${duration})`).moveDown(0.4);
        doc.lineTo(0, doc.page.width)
            .stroke();
    }
}

module.exports = {
    normalOrder: normalOrder
}