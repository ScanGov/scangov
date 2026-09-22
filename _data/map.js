import { default as domainJS } from './domains.js';

const domainList = domainJS();

import { statePaths as paths } from '../scripts/state-paths.js';


export default () => {
    const returnPaths = [];
    const localPaths = [...paths];

    for (let i = 0; i < domainList.length; i++) {
        const domain = domainList[i];

        for (let j = 0; j < localPaths.length; j++) {
            const path = localPaths[j];

            if (domain.name === path.name) {
                localPaths.splice(j, 1);

                const scores = { overall: domain.status < 300 ? domain.overallScore : -1 };
                for (const key in domain.scores)
                    if (domain.scores[key].score >= 0)
                        scores[key] = domain.status < 300 ? domain.scores[key].score : -1;

                returnPaths.push({
                    url: domain.urlkey,
                    name: path.name,
                    status: domain.status,
                    path: path.path,
                    scores
                });

                break;
            }
        }
    }

    return returnPaths;
};
