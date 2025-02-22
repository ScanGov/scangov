import * as fs from 'fs'

export default function () {

  try {
    let updatedTimeStamp = fs.readFileSync('./public/data/updated_time');
    console.log('time stamp is: '+updatedTimeStamp)
    let lastUpdatedDate = new Date(parseInt(updatedTimeStamp)).toLocaleDateString();
    console.log('date is: '+lastUpdatedDate);
    return lastUpdatedDate;
  } catch(e) {
    console.log('failure to read date files')
    console.log(e)
  }
  
  return '';
}
