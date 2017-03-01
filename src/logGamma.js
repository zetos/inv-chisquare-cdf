module.exports = function logGamma(x) {
    if(x===1 || x===2) {
        return 0;
    } else if(x===0) {
        return Infinity;
    } else if(isNaN(x)) {
        // TODO fix: booleans and strings like '123' will not fall here.
        throw new Error(`The value is not a number.`);
    } else if(x<0) {
        throw new Error(`The value is a negative number.`);
    }

    // Lanczos approximation
    const cof = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.1208650973866179e-2,
    -0.5395239384953e-5,
    ];
    let ser = 1.000000000190015;

    let xx;
    let y;
    let tmp;
    tmp = (y = xx = x) + 5.5;
    tmp -= (xx + 0.5) * Math.log(tmp);

    cof.map((approximation)=>{
        ser += approximation / ++y;
    });

    return Math.log(2.5066282746310005 * ser / xx) - tmp;
};
