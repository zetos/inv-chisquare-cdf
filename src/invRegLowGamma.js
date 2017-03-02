const logGamma = require('./logGamma.js');
const regLowGamma = require('./regLowGamma.js');

module.exports = function invRegLowGamma(p, a) {
    if(isNaN(p)) {
        // TODO fix: booleans and strings like '123' will not fall here.
        throw new Error('The value in param "p" is not an number.');
    } else if(isNaN(a)) {
        // TODO fix: booleans and strings like '123' will not fall here.
        throw new Error('The value in param "a" is not an number.');
    } else if (p >= 1) {
        return Math.max(100, a + 100 * Math.sqrt(a));
    } else if (p <= 0) {
        return 0;
    }

    let a1 = a - 1;
    let EPS = 1e-8;
    let gln = logGamma(a);
    let inverseRegLowGamma;
    let err;
    let t;
    let u;
    let pp;
    let lna1;
    let afac;

    if (a > 1) {
        lna1 = Math.log(a1);
        afac = Math.exp(a1 * (lna1 - 1) - gln);
        pp = (p < 0.5) ? p : 1 - p;
        t = Math.sqrt(-2 * Math.log(pp));
        inverseRegLowGamma = (2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t;
        if (p < 0.5)
        inverseRegLowGamma = -inverseRegLowGamma;
        inverseRegLowGamma = Math.max(1e-3,
        a * Math.pow(1 - 1 / (9 * a) - inverseRegLowGamma / (3 * Math.sqrt(a)), 3));
    } else {
        t = 1 - a * (0.253 + a * 0.12);
        if (p < t)
        inverseRegLowGamma = Math.pow(p / t, 1 / a);
        else
        inverseRegLowGamma = 1 - Math.log(1 - (p - t) / (1 - t));
    }

    for(let j = 0; j < 12; j++) {
        if (inverseRegLowGamma <= 0)
        return 0;
        err = regLowGamma(a, inverseRegLowGamma) - p;
        if (a > 1)
        t = afac * Math.exp(-(inverseRegLowGamma - a1) + a1 * (Math.log(inverseRegLowGamma) - lna1));
        else
        t = Math.exp(-inverseRegLowGamma + a1 * Math.log(inverseRegLowGamma) - gln);
        u = err / t;
        inverseRegLowGamma -= (t = u / (1 - 0.5 * Math.min(1, u * ((a - 1) / inverseRegLowGamma - 1))));
        if (inverseRegLowGamma <= 0)
        inverseRegLowGamma = 0.5 * (inverseRegLowGamma + t);
        if (Math.abs(t) < EPS * inverseRegLowGamma)
        break;
    }

    return inverseRegLowGamma;
};
