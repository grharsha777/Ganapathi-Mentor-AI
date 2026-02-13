
export interface TMDBMovie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
}

const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function searchTMDB(query: string): Promise<TMDBMovie[]> {
    if (!TMDB_API_KEY) {
        console.warn('TMDB_API_KEY is not configured');
        return [];
    }

    try {
        const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);

        if (!res.ok) {
            throw new Error(`TMDB API Error: ${res.statusText}`);
        }

        const data = await res.json();
        return (data.results || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            overview: item.overview,
            poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
            release_date: item.release_date,
            vote_average: item.vote_average
        }));
    } catch (error) {
        console.error('TMDB Search Error:', error);
        return [];
    }
}
