/* eslint no-undef: "error"*/
/* eslint-env mocha*/

const logGamma = require('./logGamma.js');
const expect = require('chai').expect;

describe('logGamma', function() {
	describe('smoke tests', function() {
		it('should exist', ()=>{
			expect(logGamma).to.exist;
		});

		it('should be a function', ()=>{
			expect(logGamma).to.be.a('function');
		});
	});

	describe('the function returns the logarithm of the gamma function', function() {
		it('should return 1.20097360234 for the input 3.5', ()=>{
			expect(logGamma(3.5)).to.equal(1.2009736023470738);
		});

		it('should return 9.210282658633963 for the input 0.0001', ()=>{
			expect(logGamma(0.0001)).to.equal(9.210282658633963);
		});

		it('should return 3.1780538303479453 for the input 5', ()=>{
			expect(logGamma(5)).to.equal(3.1780538303479453);
		});

		it('should return 0 for the input 1', ()=>{
			expect(logGamma(1)).to.equal(0);
		});

		it('should return 0 for the input 2', ()=>{
			expect(logGamma(2)).to.equal(0);
		});

		it('should return +Infinity for the input 0', ()=>{
			expect(logGamma(0)).to.equal(Infinity);
		});
	});

	describe('error tests', function() {
		it('should return a error for a NaN input', ()=>{
			expect(()=>logGamma('Not a number')).to.throw('The value is not a number.');
		});

		it('should return a error for a negative number', ()=>{
			expect(()=>logGamma(-666)).to.throw('The value is a negative number.');
		});
	});
});
