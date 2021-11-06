module.exports = {
    env: {
      es6: true,
      node: true
    },
    extends: ['airbnb-base', 'prettier'],
    plugins: ['prettier'],
    parserOptions: {
      'ecmaVersion': 12,
      'sourceType': 'module'
    },
    rules: {
      'class-methods-use-this': 'off',
      'no-param-reassign': 'off',
      camelcase: 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
      'no-shadow': 'warn',
      'no-useless-escape': 'off',
      'consistent-return': 'off',
      'no-underscore-dangle': 'warn',
      'no-plusplus': 'off'
    }
  }