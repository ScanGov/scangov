import { readFileSync } from 'fs';
import { default as domainJS } from './domains.js';

const domainList = domainJS();

export default () => {
    const cities = JSON.parse(readFileSync('./_data/city_locs.json', 'utf8'));

    for (let i = 0; i < cities.length; i++) {
        const city = cities[i];

        for (let j = 0; j < domainList.length; j++) {
            const domain = domainList[j];

            if (domain.urlkey === city.url) {
                if (domain.status < 300)
                    cities[i].score = domain.overallScore;
                else
                    cities[i].score = -1;
                domainList.splice(j, 1);
                break;
            }
        }
    }

    return cities;
};
