const invChiSquareCDF = require('./invChiSquareCDF.js');
const invRegLowGamma = require('./invRegLowGamma.js');
const logGamma = require('./logGamma.js');
const regLowGamma = require('./regLowGamma.js');

module.exports = {
  invChiSquareCDF: (probability, degreeOfFreedom)=>invChiSquareCDF(probability, degreeOfFreedom),
  invRegLowGamma: (p, a)=>invRegLowGamma(p, a),
  logGamma: (x)=>logGamma(x),
  regLowGamma: (a, x)=>regLowGamma(a, x),
};
