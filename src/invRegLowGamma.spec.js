/* eslint-env mocha*/

const invRegLowGamma = require('./invRegLowGamma.js');
const expect = require('chai').expect;

describe('invRegLowGamma', function() {
	describe('smoke tests', function() {
		it('should exist', ()=>{
			expect(invRegLowGamma).to.exist;
		});

		it('should be a function', ()=>{
			expect(invRegLowGamma).to.be.a('function');
		});
	});

	describe('Returns the inverse of the lower regularized incomplete Gamma function evaluated at (p,a)', function() {
		it('should return 228.60679774997897 for p=5 and a=5', ()=>{
			expect(invRegLowGamma(5, 5)).to.equal(228.60679774997897);
		});

		it('should return 6.475606702314761 for p=0.666 and a=5.75', ()=>{
			expect(invRegLowGamma(0.666, 5.75)).to.equal(6.475606702314761);
		});

		it('should return 100 for p=5 and a=0', ()=>{
			expect(invRegLowGamma(5, 0)).to.equal(100);
		});

        it('should return 1.678346990016661 for p=0.5 and a=2', ()=>{
			expect(invRegLowGamma(0.5, 2)).to.equal(1.678346990016661);
		});

        it('should return 0.3759413598815398 for p=0.5 and a=0.666', ()=>{
			expect(invRegLowGamma(0.5, 0.666)).to.equal(0.3759413598815398);
		});

        it('should return 0 for p=-1(any negative number) and a=2', ()=>{
			expect(invRegLowGamma(-1, 2)).to.equal(0);
		});
	});

	describe('error tests', function() {
		it('should return a error for a NaN input in the parameter: p', ()=>{
			expect(()=>invRegLowGamma('Not a number', 6)).to.throw('The value in param "p" is not an number.');
		});

        it('should return a error for a NaN input in the parameter: a', ()=>{
			expect(()=>invRegLowGamma(6, 'Not a number')).to.throw('The value in param "a" is not an number.');
		});
	});
});
