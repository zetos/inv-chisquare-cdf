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
});
