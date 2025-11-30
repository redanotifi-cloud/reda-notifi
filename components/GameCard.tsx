import React from 'react';
import { ThumbsUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <Link to={`/games/${game.id}`} className="group block">
      <div className="bg-transparent rounded-xl overflow-hidden transition-transform transform hover:-translate-y-1">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-800 relative">
            <img 
              src={game.thumbnail} 
              alt={game.title} 
              className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
              loading="lazy"
            />
            {/* Hover overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="pt-2">
          <h3 className="font-bold text-white text-lg truncate group-hover:underline decoration-white underline-offset-2">
            {game.title}
          </h3>
          
          <div className="flex items-center justify-between mt-1 text-gray-400 text-xs">
             <div className="flex items-center gap-1">
               <ThumbsUp className="w-3 h-3" />
               <span>{game.likes > 999 ? (game.likes / 1000).toFixed(1) + 'k' : game.likes}%</span>
             </div>
             <div className="flex items-center gap-1">
               <Users className="w-3 h-3" />
               <span>{game.players.toLocaleString()}</span>
             </div>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">By {game.creator}</p>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;