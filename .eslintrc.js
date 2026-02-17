module.exports = {
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    extends: 'airbnb',
    rules: {
        indent: [
            'error',
            4,
        ],
        'linebreak-style': [
            'error',
            'unix',
        ],
        quotes: [
            'error',
            'single',
        ],
        semi: [
            'error',
            'always',
        ],
        'no-console': 'off',
        'no-trailing-spaces': 'error',
        'no-await-in-loop': 'off',
        'func-names': 'off',
        'no-param-reassign': [
            'error', { props: false },
        ],
        'no-continue': 'off',
        'max-len': 'off',
        'no-return-assign': 'off',
        'no-unused-expressions': 'off', // Allow chai assertions like .to.be.true
        'no-plusplus': 'off', // Allow ++ operator
        'no-restricted-syntax': 'off', // Allow for...of loops
        'consistent-return': 'off', // Allow functions without explicit return
    },
    globals: {
        describe: false,
        beforeEach: false,
        afterEach: false,
        jasmine: false,
        it: false,
        expect: false,
    },
};
