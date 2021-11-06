module.exports = {
    env: {
      es6: true,
      node: true
    },
    extends: ['airbnb-base', 'prettier'],
    plugins: ['prettier'],
    rules: {
      'class-methods-use-this': 'off',
      'no-param-reassign': 'off',
      camelcase: 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: 'next' }]
    }
};