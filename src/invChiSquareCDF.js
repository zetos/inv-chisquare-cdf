const invRegLowGamma = require('./invRegLowGamma.js');

module.exports = function invChiSquareCDF(probability, degreeOfFreedom) {
    if(isNaN(probability)) {
        // TODO fix: booleans and strings like '123' will not fall here.
        throw new Error('The value in param "probability" is not an number.');
    } else if(isNaN(degreeOfFreedom)) {
        // TODO fix: booleans and strings like '123' will not fall here.
        throw new Error('The value in param "degreeOfFreedom" is not an number.');
    } else if (probability >= 1 || probability <= 0) {
        throw new Error('The number in param "probability" must lie in the interval [0 1].');
    } else if (degreeOfFreedom <= 0) {
        throw new Error('The number in param "degreeOfFreedom" must be greater than 0.');
    }

    return 2 * invRegLowGamma(probability, 0.5 * degreeOfFreedom);
};
