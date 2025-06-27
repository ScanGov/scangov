import * as fs from 'fs';

export async function appendChangelog(newdata, olddata) {

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

  let newDataToAppend = false;
  let lastScanTime = 0;
  let pastChangesData = JSON.parse(fs.readFileSync('./public/data/myscangov_changes.json','utf8'));
  for(urlItem in changes) {
    for(dateItem in changes[urlItem]) {
      if(!pastChangesData[urlItem][dateItem]) {
        newDataToAppend = true;
        pastChangesData[urlItem][dateItem] = changes[urlItem][dateItem];
      } else {
        if(dateItem > lastScanTime) {
          lastScanTime = dateItem;
        }
      }
    }
  }

  fs.writeFileSync('./public/data/myscangov_changes.json',JSON.stringify(pastChangesData),'utf8');
  
  if(newDataToAppend) { // I have new data which I have appended to the changelog json
    fs.writeFileSync('./scripts/data/lastscan.json',JSON.stringify(newdata),'utf8')
    fs.writeFileSync('./scripts/data/scan_'+lastScanTime+'.json',JSON.stringify(olddata),'utf8')
    // save the newdata locally for use by non async use by _data files (This is called in eleventy.config before)
    // also save the last stored json in timestamped file
  }
  
}