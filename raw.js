const geoip = require('fast-geoip');

async function lookupIP() {
    const ip = "42.96.57.22";
    const geo = await geoip.lookup(ip);
    console.log(geo);
}

lookupIP();
