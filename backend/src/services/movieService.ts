import { Collection, Sort } from 'mongodb';
import { database } from '../config/database';
import { Movie, MongoQuery } from '../types/movie';

export class MovieService {
  private collection: Collection<Movie>;

  constructor() {
    const collectionName = database.getCollectionName();
    this.collection = database.getDb().collection<Movie>(collectionName);
    // Log collection stats on initialization
    this.logCollectionStats();
  }

  private async logCollectionStats() {
    try {
      const count = await this.collection.countDocuments();
      console.log(`Collection '${database.getCollectionName()}' has ${count} documents`);
      
      if (count === 0) {
        console.warn('Warning: Collection is empty. Please ensure data is loaded.');
      } else {
        // Log a sample document to verify structure
        const sampleDoc = await this.collection.findOne({});
        if (sampleDoc) {
          console.log('Sample document structure:', {
            _id: sampleDoc._id,
            title: sampleDoc.title,
            genres: sampleDoc.genres,
            year: sampleDoc.year,
            // Log other important fields
          });
        }
      }
    } catch (error) {
      console.error('Error getting collection stats:', error);
      throw new Error('Failed to initialize MovieService: Database error');
    }
  }

  public async executeQuery(query: MongoQuery): Promise<Movie[]> {
    try {
      const { filter, projection, sort, limit, skip } = query;
      
      console.log('Executing MongoDB query:', JSON.stringify(query, null, 2));
      
      // Validate the query
      if (!filter || typeof filter !== 'object') {
        throw new Error('Invalid query: filter is required and must be an object');
      }

      const cursor = this.collection.find(filter, {
        projection: projection || undefined,
        sort: sort as Sort || undefined,
        limit: limit || undefined,
        skip: skip || undefined
      });

      const results = await cursor.toArray();
      console.log(`Query returned ${results.length} results`);
      
      if (results.length === 0) {
        // Try a simple query to verify data access
        const testDoc = await this.collection.findOne({});
        if (!testDoc) {
          console.error('No documents found in collection. Database might be empty.');
        }
      }

      return results;
    } catch (error) {
      console.error('Error executing query:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to execute MongoDB query: ${error.message}`);
      }
      throw new Error('Failed to execute MongoDB query: Unknown error');
    }
  }

  public async getMovieById(id: string): Promise<Movie | null> {
    try {
      return await this.collection.findOne({ _id: id });
    } catch (error) {
      console.error('Error fetching movie by ID:', error);
      throw new Error('Failed to fetch movie');
    }
  }

  public async searchMovies(searchTerm: string): Promise<Movie[]> {
    try {
      const query = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { plot: { $regex: searchTerm, $options: 'i' } },
          { directors: { $regex: searchTerm, $options: 'i' } },
          { cast: { $regex: searchTerm, $options: 'i' } }
        ]
      };
      
      return await this.collection.find(query).limit(10).toArray();
    } catch (error) {
      console.error('Error searching movies:', error);
      throw new Error('Failed to search movies');
    }
  }
} 