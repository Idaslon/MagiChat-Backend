module.exports = {
  type: process.env.TYPEORM_TYPE,
  database: process.env.TYPEORM_DATABASE,
  url: process.env.TYPEORM_URL,

  logging: true,
  synchronize: true,

  entities: [
    `${__dirname}/dist/database/entity/**/*{.ts,.js}`,
    // `${__dirname}/src/database/entity/**/*{.ts,.js}`,
    // 'src/database/entity/**/*{.ts,.js}',
    // 'dist/database/entity/**/*{.ts,.js}'
  ],
  migrations: [
    'src/database/migration/**/*.ts',
    'database/migration/**/*.js' // heroku
  ],
  cli: {
    migrationsDir: 'src/database/migration'
  }
}
// `${__dirname}/**/entity/**/*{.ts,.js}`,
// require('path').join(__dirname, '**/entity/**/*{.ts,.js}')

