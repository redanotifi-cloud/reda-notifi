import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';
import GameCard from '../components/GameCard';
import { Game } from '../types';
import { generateGameIdeas } from '../services/geminiService';

const MOCK_GAMES: Game[] = [
  {
    id: 'brainrot-1',
    title: 'Steal a Brainrot [NEW]',
    description: 'Survive the chaos in Ohio, dodge the skibidi toilets, and steal the ultimate Sigma Rizz. Very demure, very mindful.',
    thumbnail: 'https://picsum.photos/seed/brainrot123/400/225',
    creator: 'Rizzler_99',
    likes: 99,
    players: 1000000,
    genre: 'Brainrot'
  },
  {
    id: '1',
    title: 'Brookhaven RP',
    description: 'A place to hang out with like minded people and roleplay. Own and live in amazing houses, drive cool vehicles and explore the city.',
    thumbnail: 'https://picsum.photos/seed/brookhaven/400/225',
    creator: 'Wolfpaq',
    likes: 92,
    players: 452000,
    genre: 'RP'
  },
  {
    id: '2',
    title: 'Tower of Hell',
    description: 'Reach the top of the tower made of randomly generated stages before the clock runs out.',
    thumbnail: 'https://picsum.photos/seed/tower/400/225',
    creator: 'YXCeptional',
    likes: 85,
    players: 12000,
    genre: 'Obby'
  },
  {
    id: '3',
    title: 'Adopt Me!',
    description: 'Raise and dress cute pets, decorate your house, and play with friends in the magical world of Adopt Me!',
    thumbnail: 'https://picsum.photos/seed/adoptme/400/225',
    creator: 'DreamCraft',
    likes: 95,
    players: 680000,
    genre: 'RPG'
  },
  {
    id: '4',
    title: 'Blox Fruits',
    description: 'Become a master swordsman or a powerful blox fruit user as you train to become the strongest player to ever live.',
    thumbnail: 'https://picsum.photos/seed/bloxfruits/400/225',
    creator: 'Gamer Robot Inc',
    likes: 98,
    players: 890000,
    genre: 'Adventure'
  }
];

interface HomeProps {
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  games: Game[];
}

const Home: React.FC<HomeProps> = ({ setGames, games }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial Load if empty
    if (games.length === 0) {
        setGames(MOCK_GAMES);
    }
  }, [games.length, setGames]);

  const handleGenerateMore = async () => {
    setLoading(true);
    const newGames = await generateGameIdeas(4);
    if (newGames.length > 0) {
      setGames(prev => [...newGames, ...prev]);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Welcome to BloxClone</h1>
        <p className="text-gray-400">Discover millions of experiences created by a global community.</p>
      </div>

      {/* Recommended Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Recommended for You
          </h2>
          <button 
            onClick={handleGenerateMore}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Imagining...' : 'AI Generate New Games'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* Continue Playing Section (Static mock) */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Continue Playing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
           {games.slice(0, 3).map((game) => (
             <GameCard key={`recent-${game.id}`} game={game} />
           ))}
        </div>
      </div>
    </div>
  );
};

export default Home;