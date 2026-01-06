import { ExternalLink, Calendar, Newspaper } from "lucide-react";

interface NewsCardProps {
  title: string;
  summary: string;
  imageUrl: string;
  articleUrl: string;
  source?: string;
  pubDate?: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    // Parse YYYY-MM-DD directly without timezone conversion
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
    // Fallback: return as-is if can't parse
    return dateStr;
  } catch {
    return dateStr;
  }
};

const NewsCard = ({ title, summary, imageUrl, articleUrl, source, pubDate }: NewsCardProps) => {
  return (
    <article className="glass-card news-card flex flex-col h-full">
      <div className="relative h-44 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            // Fallback to default image on error
            e.currentTarget.src = 'https://images.unsplash.com/photo-1599825407615-a1ee8e6a0e8b?w=800&h=600&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-base font-semibold font-heading text-foreground mb-2 line-clamp-2 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">
          {summary}
        </p>

        {/* Source and Date */}
        <div className="flex items-center gap-3 text-xs text-agro-gold-light mb-3">
          {source && (
            <div className="flex items-center gap-1">
              <Newspaper className="w-3 h-3" />
              <span>{source}</span>
            </div>
          )}
          {pubDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(pubDate)}</span>
            </div>
          )}
        </div>

        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold inline-flex items-center justify-center gap-2 text-sm mt-auto"
        >
          <span>Ler mais</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </article>
  );
};

export default NewsCard;
