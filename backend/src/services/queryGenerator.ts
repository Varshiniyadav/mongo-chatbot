import { MongoQuery } from '../types/movie';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class QueryGenerator {
  private static readonly SYSTEM_PROMPT = `You are a MongoDB query generator. 
  Convert natural language questions about movies into MongoDB queries.
  The movie collection has the following schema:
  {
    _id: ObjectId,
    plot: string,
    genres: string[],  // This is an array field, use $in operator to search in arrays
    runtime: number,
    cast: string[],    // This is an array field, use $in operator to search in arrays
    title: string,
    fullplot: string,
    countries: string[], // This is an array field, use $in operator to search in arrays
    released: Date,
    directors: string[], // This is an array field, use $in operator to search in arrays
    rated: string,
    awards: { wins: number, nominations: number, text: string },
    year: number,
    imdb: { rating: number, votes: number, id: number },
    type: string,
    tomatoes: { viewer: { rating: number, numReviews: number, meter: number } }
  }
  
  Important: For array fields (genres, cast, countries, directors), use the $in operator to search.
  Example: To find horror movies, use: { "genres": { "$in": ["Horror"] } }
  
  Return only valid MongoDB queries in JSON format with filter, projection, sort, limit, and skip fields.
  Example response format:
  {
    "filter": { "genres": { "$in": ["Horror"] } },
    "projection": { "title": 1, "genres": 1, "imdb.rating": 1 },
    "sort": { "imdb.rating": -1 },
    "limit": 10
  }`;

  public static async generateQuery(message: string): Promise<MongoQuery> {
    try {
      console.log('Sending request to Groq API...');
      console.log('Message:', message);

      const requestBody = {
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: this.SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error response:', errorText);
        throw new Error(`Groq API error: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      console.log('Groq API response:', JSON.stringify(data, null, 2));

      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.error('No content in Groq API response:', data);
        throw new Error('No response content from Groq API');
      }

      try {
        // Parse the response as JSON
        const query = JSON.parse(content) as MongoQuery;
        console.log('Parsed query:', JSON.stringify(query, null, 2));
        return query;
      } catch (parseError) {
        console.error('Failed to parse Groq API response as JSON:', content);
        throw new Error('Invalid JSON response from Groq API');
      }
    } catch (error) {
      console.error('Error in generateQuery:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate MongoDB query: ${error.message}`);
      }
      throw error;
    }
  }
} 