/* eslint-env mocha*/

const {invChiSquareCDF} = require('./index.js');
const {invRegLowGamma} = require('./index.js');
const {logGamma} = require('./index.js');
const {regLowGamma} = require('./index.js');

const expect = require('chai').expect;

describe('index', function() {
	describe('Every function on package should be avaliable', function() {
		it('invChiSquareCDF should exist', ()=>{
			expect(invChiSquareCDF).to.exist;
		});

		it('invChiSquareCDF should be a function', ()=>{
			expect(invChiSquareCDF).to.be.a('function');
		});

        it('invRegLowGamma should exist', ()=>{
			expect(invRegLowGamma).to.exist;
		});

		it('invRegLowGamma should be a function', ()=>{
			expect(invRegLowGamma).to.be.a('function');
		});

        it('logGamma should exist', ()=>{
			expect(logGamma).to.exist;
		});

		it('logGamma should be a function', ()=>{
			expect(logGamma).to.be.a('function');
		});

        it('regLowGamma should exist', ()=>{
			expect(regLowGamma).to.exist;
		});

		it('regLowGamma should be a function', ()=>{
			expect(regLowGamma).to.be.a('function');
		});
	});
});
