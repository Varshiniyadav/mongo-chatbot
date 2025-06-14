import express from 'express';
import cors from 'cors';
import { database } from './config/database';
import { QueryGenerator } from './services/queryGenerator';
import { MovieService } from './services/movieService';
import { ChatRequest, ChatResponse } from './types/movie';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

let movieService: MovieService;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body as ChatRequest;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        query: '',
        result: [],
        error: 'Invalid request: message is required and must be a string'
      });
    }

    console.log('Processing chat message:', message);
    
    // Generate MongoDB query from the message
    const query = await QueryGenerator.generateQuery(message);
    console.log('Generated query:', JSON.stringify(query, null, 2));
    
    // Execute the query
    const results = await movieService.executeQuery(query);
    console.log(`Query returned ${results.length} results`);
    
    const response: ChatResponse = {
      query: JSON.stringify(query),
      result: results
    };
    
    res.json(response);
  } catch (error) {
    console.error('Chat endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      query: '',
      result: [],
      error: `Failed to process chat message: ${errorMessage}`
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await movieService.searchMovies(q);
    res.json(results);
  } catch (error) {
    console.error('Search endpoint error:', error);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// Start server
async function startServer() {
  try {
    // First connect to the database
    await database.connect();
    
    // Then initialize the service
    movieService = new MovieService();
    
    // Finally start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Health check available at http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

startServer();