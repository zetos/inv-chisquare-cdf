const logGamma = require('./logGamma.js');

module.exports = function regLowGamma(a, x) {
    if(isNaN(a)) {
        // TODO fix: booleans and strings like '123' will not fall here.
        throw new Error('The value in param a is not a number.');
    } else if(isNaN(x)) {
        // TODO fix: booleans and strings like '123' will not fall here.
        throw new Error('The value in param x is not a number.');
    } else if(a <= 0) {
        throw new Error('The number in param a is equal or less tham 0.');
    } else if(x<0) {
        throw new Error('The number in param x is a negative number.');
    }

    const logGammaOfA = logGamma(a);
    let b = x + 1 - a;
    let c = 1 / 1.0e-30;
    let d = 1 / b;
    let h = d;
    let i = 1;
    const maxOfIterationsForA = -~(Math.log((a >= 1) ? a : 1 / a) * 8.5 + a * 0.4 + 17);

    if (x < a + 1) {
        let sum = 1 / a;
        let del = sum;
        for (let ap = a; i <= maxOfIterationsForA; i++) {
            sum += del *= x / ++ap;
        }
        return (sum * Math.exp(-x + a * Math.log(x) - (logGammaOfA)));
    }

    let an;
    for (; i <= maxOfIterationsForA; i++) {
        an = -i * (i - a);
        b += 2;
        d = an * d + b;
        c = b + an / c;
        d = 1 / d;
        h *= d * c;
    }

    return (1 - h * Math.exp(-x + a * Math.log(x) - (logGammaOfA)));
};
