module.exports = {
    'env': {
        'browser': true,
        'node': true,
        'es6': true
    },
    "extends": "airbnb",
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'no-console': 'off',
        'no-trailing-spaces': 'error'
    },
    'globals': {
        'describe': false,
        'beforeEach': false,
        'afterEach': false,
        'jasmine': false,
        'it': false,
        'expect': false
    }
};