/* eslint-env mocha*/

const invChiSquareCDF = require('./invChiSquareCDF.js');
const expect = require('chai').expect;

describe('invChiSquareCDF', function() {
	describe('smoke tests', function() {
		it('should exist', ()=>{
			expect(invChiSquareCDF).to.exist;
		});

		it('should be a function', ()=>{
			expect(invChiSquareCDF).to.be.a('function');
		});
	});

	describe('Returns the inverse chi-square cdf with "degreeOfFreedom" for the "probability".', function() {
		it('should return 0.10258658877510105 for probability=0.05 and degreeOfFreedom=2', ()=>{
			expect(invChiSquareCDF(0.05, 2)).to.equal(0.10258658877510105);
		});

		it('should return 18.307038053275143 for probability=0.95 and degreeOfFreedom=10', ()=>{
			expect(invChiSquareCDF(0.95, 10)).to.equal(18.307038053275143);
		});
	});

	describe('error tests', function() {
		it('should return a error for a NaN input in the parameter: probability', ()=>{
			expect(()=>invChiSquareCDF('Not a number', 6)).to.throw('The value in param "probability" is not an number.');
		});

        it('should return a error for a NaN input in the parameter: degreeOfFreedom', ()=>{
			expect(()=>invChiSquareCDF(6, 'Not a number')).to.throw('The value in param "degreeOfFreedom" is not an number.');
		});

        it('should return a error for the number 0 in the parameter: probability', ()=>{
			expect(()=>invChiSquareCDF(0, 2)).to.throw('The number in param "probability" must lie in the interval [0 1].');
		});

        it('should return a error for a negative number in the parameter: probability', ()=>{
			expect(()=>invChiSquareCDF(-1, 2)).to.throw('The number in param "probability" must lie in the interval [0 1].');
		});

        it('should return a error for the number 1 in the parameter: probability', ()=>{
			expect(()=>invChiSquareCDF(1, 2)).to.throw('The number in param "probability" must lie in the interval [0 1].');
		});

        it('should return a error for a number greater than 1 in the parameter: probability', ()=>{
			expect(()=>invChiSquareCDF(666, 2)).to.throw('The number in param "probability" must lie in the interval [0 1].');
		});

        it('should return a error for the number 0 in the parameter: degreeOfFreedom', ()=>{
			expect(()=>invChiSquareCDF(0.05, 0)).to.throw('The number in param "degreeOfFreedom" must be greater than 0.');
		});

        it('should return a error for a negative number in the parameter: degreeOfFreedom', ()=>{
			expect(()=>invChiSquareCDF(0.05, -2)).to.throw('The number in param "degreeOfFreedom" must be greater than 0.');
		});
	});
});
