import * as fs from 'fs';

export async function getData(url, local = false) {
  return new Promise(async (resolve) => {
    let fileLoc = url.replace('https://github.com/ScanGov/data/raw/refs/heads/main/','');
    if(local && fs.existsSync('../data/'+fileLoc)) {
      resolve(JSON.parse(fs.readFileSync('../data/'+fileLoc,'utf8')));
    } else {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
  
        const json = await response.json();
        console.log('got '+url);
        resolve(json);
      } catch (error) {
        throw new Error(`Fetch error: ${error.message}`);
      }
    }
  });
}