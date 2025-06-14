import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'mongodb';
const COLLECTION_NAME = 'chatbot'; // Changed from 'chatbot' to 'movies' as it's more standard

class Database {
  private static instance: Database;
  private client: MongoClient;
  private db: Db | null = null;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000, // Give up initial connection after 10s
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Already connected to MongoDB');
      return;
    }

    try {
      console.log('Connecting to MongoDB...');
      console.log('URI:', MONGODB_URI);
      console.log('Database:', DB_NAME);
      
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      
      // Verify connection by listing collections
      const collections = await this.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
      
      // Verify our target collection exists
      const collectionExists = collections.some(c => c.name === COLLECTION_NAME);
      if (!collectionExists) {
        console.warn(`Collection '${COLLECTION_NAME}' not found. Available collections:`, collections.map(c => c.name));
      }
      
      this.isConnected = true;
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public getDb(): Db {
    if (!this.db || !this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  public getCollectionName(): string {
    return COLLECTION_NAME;
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.close();
      this.isConnected = false;
      this.db = null;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}

export const database = Database.getInstance();