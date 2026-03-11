import { Film } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MovieCardProps {
  id: string;
  title: string;
  year: string;
  rating?: string;
  poster: string | null;
}

export function MovieCard({ id, title, year, rating, poster }: MovieCardProps) {
  return (
    <a
      href={`https://www.imdb.com/title/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <Card className="overflow-hidden bg-neutral-900 border-neutral-800 hover:border-amber-500/50 transition-all duration-300 h-full flex flex-col hover:shadow-xl hover:shadow-amber-500/10">
        <div className="relative bg-neutral-950 aspect-[2/3] overflow-hidden">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
              <div className="flex flex-col items-center gap-2">
                <Film className="w-12 h-12 text-neutral-600" />
                <span className="text-xs text-neutral-500">No poster</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-neutral-100 line-clamp-2 group-hover:text-amber-400 transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>{year}</span>
              {rating && rating !== 'N/A' && (
                <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-sm font-semibold">
                  ⭐ {rating}
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-neutral-600 group-hover:text-amber-400/70 transition-colors pt-2 border-t border-neutral-800">
            View on IMDb →
          </div>
        </div>
      </Card>
    </a>
  );
}
