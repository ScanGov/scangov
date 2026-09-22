// Port of d3's geoAlbersUsa (via county-viz/build/albers.py): a conic
// equal-area projection of the lower 48 with Alaska and Hawaii inset at the
// lower left, framed the way us-atlas frames it (975 x 610, scale 1300,
// translate 487.5 / 305). Matches the plane of the state and county outlines
// in _data/countyGeo.json, so a longitude and latitude can be placed on them.

const rad = d => d * Math.PI / 180;

function conicEqualAreaRaw(phi0, phi1) {
    const sy0 = Math.sin(phi0);
    const n = (sy0 + Math.sin(phi1)) / 2;
    const c = 1 + sy0 * (2 * n - sy0);
    const r0 = Math.sqrt(c) / n;
    return (lam, phi) => {
        const r = Math.sqrt(Math.max(0, c - 2 * n * Math.sin(phi))) / n;
        const x = lam * n;
        return [r * Math.sin(x), r0 - r * Math.cos(x)];
    };
}

function conic(parallels, rotate, center, scale, translate) {
    const raw = conicEqualAreaRaw(rad(parallels[0]), rad(parallels[1]));
    const rot = rad(rotate[0]);
    const [cx, cy] = raw(rad(center[0]), rad(center[1]));
    const [tx, ty] = translate;
    return (lon, lat) => {
        let lam = rad(lon) + rot;
        lam = ((lam + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
        const [px, py] = raw(lam, rad(lat));
        return [tx + scale * (px - cx), ty - scale * (py - cy)];
    };
}

export function albersUsa(scale = 1300, translate = [487.5, 305]) {
    const k = scale;
    const [x, y] = translate;
    const lower48 = conic([29.5, 45.5], [96, 0], [-0.6, 38.7], k, [x, y]);
    const alaska = conic([55, 65], [154, 0], [-2, 58.5], k * 0.35, [x - 0.307 * k, y + 0.201 * k]);
    const hawaii = conic([8, 18], [157, 0], [-3, 19.9], k, [x - 0.205 * k, y + 0.212 * k]);
    // Inset chosen by location: Alaska north of 50 and west of -130, Hawaii south of 23 and west of -150.
    return (lon, lat) => {
        if (lat > 50 && lon < -130) return alaska(lon, lat);
        if (lat < 23 && lon < -150) return hawaii(lon, lat);
        return lower48(lon, lat);
    };
}
