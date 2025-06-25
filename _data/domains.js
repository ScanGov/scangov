import * as fs from 'fs';

export default function () {

  const data = JSON.parse(fs.readFileSync('./public/data/projectscangov.json'));

  return data;
}