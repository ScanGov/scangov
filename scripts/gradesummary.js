import { default as domainData } from '../_data/domains.js'
import * as fs from 'fs'

let domainDataFilled = domainData()

let smallDomainData = 'domain,agency,grade\n';

domainDataFilled.forEach((d) => {
  smallDomainData += `${d.urlkey},"${d.name}",${d.overallScore}\n`
})

fs.writeFileSync('./scripts/output/domains.csv',smallDomainData,'utf8');
