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

const getIcon = score => {
    if (score >= 90)
        return successIcon;
    if (score >= 70)
        return warningIcon;
    if (score >= 0)
        return dangerIcon;
    return inaccessibleIcon;
}

const getGrade = score => {
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
    console.log(city)

    L.marker([city.lat, city.long], { icon: getIcon(city.score) })
        .bindPopup(`<a href="/profile/${city.url.replaceAll('.', '-')}/overall/">${city.url}</a> ` +
            (city.score >= 0 ?
                `/ Grade ${getGrade(city.score)} / Score: ${city.score}%` :
                '/ Inaccessible')
        )
        .addTo(map);
}
