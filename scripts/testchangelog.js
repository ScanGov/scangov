// read in projectscangov
// read in public/data/generated-2025-06.json

import * as fs from 'fs';

let dataLoc = './public/data/';
dataLoc = '../public/data/';

const newdata = JSON.parse(fs.readFileSync(dataLoc+'projectscangov.json'));
const olddata = JSON.parse(fs.readFileSync(dataLoc+'generated-2025-06.json'));

let changes = {};

let newMap = new Map();
newdata.forEach(n => {
  newMap.set(n.urlkey,n);
})

olddata.forEach(o => {
  if(newMap.get(o.urlkey)) {
    let newItem = newMap.get(o.urlkey);
    let foundDiff = false;
    
    
    let allChangesThisScan = [];
    for(var topic in newItem.scores) {
      if(newItem.scores[topic] && o.scores[topic]) {
        if(newItem.scores[topic].score !== o.scores[topic].score) {
          foundDiff = true;
          let changeObj = {};
          changeObj.statusCode = 200;
          changeObj.topic = topic;
          changeObj.date = formatToYYYYMMDD(new Date(newItem.time));
          changeObj.oldScore = o.scores[topic].correct;
          changeObj.newScore = newItem.scores[topic].correct;
          changeObj.oldPercent = o.scores[topic].score;
          changeObj.newPercent = newItem.scores[topic].score;
          changeObj.oldTotal = o.scores[topic].all;;
          changeObj.newTotal = newItem.scores[topic].all;
          allChangesThisScan.push(changeObj);
        }
      }
    }
    if(foundDiff) {
      changes[o.urlkey] = {};
      changes[o.urlkey][formatToYYYYMMDD(new Date(newItem.time))] = allChangesThisScan;
    }

  } else {
    // console.log('nope '+o.urlkey)
  }
})

function formatToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

fs.writeFileSync('./changes.json',JSON.stringify(changes),'utf8');
// use new template because old one is confusing