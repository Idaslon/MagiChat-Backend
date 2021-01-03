module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@controllers': './src/app/controllers',
          '@middlewares': './src/app/middlewares',
          '@errors': './src/app/errors',
          '@utils': './src/app/utils',

          '@entity': './src/database/entity',
          '@schemas': './src/database/schemas',

          '@mytypes': './src/types',
          '@services': './src/services',
          '@config': './src/config',
          '@': './src',
        },
      },
    ],
  ],
  ignore: ['**/*/.test.ts', '**/*/.test.js', './src/types', '**/*.d.ts'],
};
