import mongoose from 'mongoose';
import { createConnection } from 'typeorm';

class Database {
  mongoConnection!: Promise<typeof mongoose>;

  constructor() {
    this.relationalTypeorm();
    this.mongo();
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL || '', {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    });
  }

  relationalTypeorm() {
    createConnection();
  }
}

export default new Database();
