const { task } = require('./task.js')
const prompt = require('prompt-sync')();

console.log("Operation");
console.log(`1) Display in Sequence(As there in YT palylist)`);
console.log(`2) Sort by Title`);
console.log(`       - Ascending order`);
console.log(`       - Descending order`);
console.log(`3) Sort by Duration`);
console.log(`       - Increasing order`);
console.log(`       - Decreasing order`);

let ch = parseInt(prompt('Tell me your choice: '));
let playListName = prompt('Enter the playlist link: ');
let order;
switch (ch) {
    case 1:
        task(playListName);
        break;
    case 2:
        order = prompt('Ascending or Descending order(Asc/Desc): ');
        task(playListName, 'title', order.toLowerCase());
        break;
    case 3:
        order = prompt('Increasing or Decreasing order(Inc/Dec): ');
        task(playListName, 'duration', order.toLowerCase());
        break;
    default:
        console.log('Wrong Choice :((');
        break;
}