export interface IMDB {
  rating: number;
  votes: number;
  id: number;
}

export interface Awards {
  wins: number;
  nominations: number;
  text: string;
}

export interface Tomatoes {
  viewer: {
    rating: number;
    numReviews: number;
    meter: number;
  };
  lastUpdated: Date;
}

export interface Movie {
  _id: string;
  plot: string;
  genres: string[];
  runtime: number;
  cast: string[];
  num_mflix_comments: number;
  title: string;
  fullplot: string;
  countries: string[];
  released: Date;
  directors: string[];
  rated: string;
  awards: Awards;
  lastupdated: string;
  year: number;
  imdb: IMDB;
  type: string;
  tomatoes: Tomatoes;
}

export interface ChatResponse {
  query: string;
  result: Movie[];
  error?: string;
}

export interface ChatRequest {
  message: string;
} 