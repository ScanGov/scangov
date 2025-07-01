const map = L.map('map').setView([39.833333, -98.583333], 4);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const ColoredMarker = L.Icon.extend({
    options: {
        iconSize: [25, 41],
        iconAnchor: [13, 40],
        popupAnchor: [0, -35],
    }
});
const successIcon = new ColoredMarker({ iconUrl: '/assets/img/marker_success.png' });
const warningIcon = new ColoredMarker({ iconUrl: '/assets/img/marker_warning.png' });
const dangerIcon = new ColoredMarker({ iconUrl: '/assets/img/marker_danger.png' });
const inaccessibleIcon = new ColoredMarker({ iconUrl: '/assets/img/marker_inaccessible.png' });

const getIcon = city => {
    if (city.status >= 300 || city.scores[topic] === undefined)
        return inaccessibleIcon;

    const score = city.scores[topic];
    if (score >= 90)
        return successIcon;
    if (score >= 70)
        return warningIcon;
    if (score >= 0)
        return dangerIcon;
}

const getGrade = city => {
    const score = city.scores[topic];
    if (score >= 90)
        return 'A';
    if (score >= 80)
        return 'B';
    if (score >= 70)
        return 'C';
    if (score >= 60)
        return 'D';
    return 'F';
}

for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    city.marker = L.marker([city.lat, city.long]).addTo(map);
}

let topic;
window.onhashchange = () => {
    topic = location.hash;
    let topicValid = false;
    if (topic.length > 1) {
        topic = topic.substring(1);
        for (const field of mapFields)
            if (field.toLowerCase() === topic) {
                topicValid = true;
                break;
            }
    }
    if (!topicValid)
        topic = 'overall';
    const previousActive = document.getElementsByClassName('map-category active')[0];
    if (previousActive)
        previousActive.classList.remove('active');
    document.getElementById(topic + '-button').classList.add('active');

    for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        city.marker
            .setIcon(getIcon(city))
            .bindPopup(`<a href="/profile/${city.url.replaceAll('.', '-')}/overall/">${city.url}</a> ` +
                (city.status < 300 ?
                    (city.scores[topic] === undefined ?
                        'No data' :
                        `/ Grade ${getGrade(city)} / Score: ${city.scores[topic]}%`
                    ) :
                    `/ Inaccessible (${city.status})`)
            );
    }
};
window.onhashchange();
