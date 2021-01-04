module.exports = {
  type: process.env.TYPEORM_TYPE,
  database: process.env.TYPEORM_DATABASE,
  url: process.env.TYPEORM_URL,

  logging: true,
  synchronize: true,
  ssl: true,

  entities: ['src/database/entity/**/*.ts'],
  migrations: ['src/database/migration/**/*.ts'],
  cli: {
    migrationsDir: 'src/database/migration'
  }
}
