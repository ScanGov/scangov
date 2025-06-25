import * as fs from 'fs';

export async function appendChangelog(newdata) {

  const olddata = JSON.parse(fs.readFileSync('./public/data/lastscan.json'));

  let changes = {};

  let oldMap = new Map();
  olddata.forEach(n => {
    oldMap.set(n.urlkey,n);
  })


  newdata.forEach(newItem => {

    if(oldMap.get[newItem.urlkey]) {
      let o = oldMap.get[newItem.urlkey];
      
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

  fs.writeFileSync('./public/data/myscangov_changes_test.json',JSON.stringify(changes),'utf8');
  
  // overwritelastscan with newdata
  // write new file using olddata naming it with timestamp
  
}