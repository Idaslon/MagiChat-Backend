module.exports = {
  type: process.env.TYPEORM_TYPE,
  database: process.env.TYPEORM_DATABASE,
  url: process.env.TYPEORM_URL,

  logging: true,
  synchronize: true,

  entities: [
    'src/database/entity/**/*.ts',
    'database/entity/**/*.js' // heroku
  ],
  migrations: [
    'src/database/migration/**/*.ts',
    'database/migration/**/*.js' // heroku
  ],
  cli: {
    migrationsDir: 'src/database/migration'
  }
}
