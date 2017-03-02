/* eslint-env mocha*/

const regLowGamma = require('./regLowGamma.js');
const expect = require('chai').expect;

describe('regLowGamma', function() {
	describe('smoke tests', function() {
		it('should exist', ()=>{
			expect(regLowGamma).to.exist;
		});

		it('should be a function', ()=>{
			expect(regLowGamma).to.be.a('function');
		});
	});

	describe('the function returns the lower regularized incomplete gamma function evaluated at (a,x)', function() {
		it('should return 0.5595067149347875 for a=5 and x=5', ()=>{
			expect(regLowGamma(5, 5)).to.equal(0.5595067149347875);
		});

		it('should return 0.9987538088133204 for a=0.666 and x=5.75', ()=>{
			expect(regLowGamma(0.666, 5.75)).to.equal(0.9987538088133204);
		});

		it('should return 0 for a=5 and x=0', ()=>{
			expect(regLowGamma(5, 0)).to.equal(0);
		});
	});

	describe('error tests', function() {
		it('should return a error for a NaN input in the parameter: a', ()=>{
			expect(()=>regLowGamma('Not a number', 6)).to.throw('The value in param a is not a number.');
		});

        it('should return a error for a NaN input in the parameter: x', ()=>{
			expect(()=>regLowGamma(6, 'Not a number')).to.throw('The value in param x is not a number.');
		});

		it('should return a error for the input 0 in the parameter: a', ()=>{
			expect(()=>regLowGamma(0, 2)).to.throw('The number in param a is equal or less tham 0.');
		});

        it('should return a error for a negative number in the parameter: a', ()=>{
			expect(()=>regLowGamma(-666, 2)).to.throw('The number in param a is equal or less tham 0.');
		});

        it('should return a error for a negative number in the parameter: x', ()=>{
			expect(()=>regLowGamma(2, -666)).to.throw('The number in param x is a negative number.');
		});
	});
});
