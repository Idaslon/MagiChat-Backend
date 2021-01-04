module.exports = {
  type: process.env.TYPEORM_TYPE,
  database: process.env.TYPEORM_DATABASE,
  url: process.env.TYPEORM_URL,

  logging: true,
  synchronize: true,

  entities: ['src/database/entity/**/*.ts', 'src/database/entity/**/*.js'],
  migrations: ['src/database/migration/**/*.ts', 'src/database/migration/**/*.js'],
  cli: {
    migrationsDir: 'src/database/migration'
  }
}
