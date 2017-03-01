module.exports = {
    "extends": ["eslint:recommended", "google"],
    "env":{
        "es6": true,
        "node": true
    },
    "plugins": [
        "mocha"
    ],
    "rules": {
         "max-len": [1, 120, 2],
         "mocha/no-exclusive-tests": "error",
    }
};