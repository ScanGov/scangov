import { readFileSync } from 'fs';
import { default as domainJS } from './domains.js';

const domainList = domainJS();

export default () => {
    const cities = JSON.parse(readFileSync('./_data/city_locs.json', 'utf8'));
    const ret = [];

    for (let i = 0; i < cities.length; i++) {
        const city = cities[i];

        for (let j = 0; j < domainList.length; j++) {
            const domain = domainList[j];

            if (domain.urlkey === city.url) {
                const scores = { overall: domain.overallScore };
                for (const topic in domain.scores)
                    scores[topic] = domain.scores[topic].score;
                city.scores = scores;
                city.status = domain.status;
                ret.push(city);

                domainList.splice(j, 1);
                break;
            }
        }
    }

    return ret;
};
