import NewsCard from "./NewsCard";
import { LucideIcon } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  articleUrl: string;
  source?: string;
  pubDate?: string;
}

interface NewsCategoryProps {
  title: string;
  icon: LucideIcon;
  news: NewsItem[];
  isHighlighted?: boolean;
  customIconSrc?: string;
}

const NewsCategory = ({ title, icon: Icon, news, isHighlighted = false, customIconSrc }: NewsCategoryProps) => {
  return (
    <section className={`animate-fade-in ${isHighlighted ? 'category-highlight' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isHighlighted
          ? 'bg-agro-gold/20 border border-agro-gold/30'
          : 'bg-agro-gold/20 border border-agro-gold/30'
          }`}>
          {customIconSrc ? (
            <img src={customIconSrc} alt={title} className="w-6 h-6 object-contain" />
          ) : (
            <Icon className={`w-6 h-6 ${isHighlighted ? 'text-agro-gold' : 'text-agro-gold'}`} />
          )}
        </div>
        <h2 className={`category-title ${isHighlighted ? 'category-title-highlight' : ''}`}>
          {title}
        </h2>
        <div className={`flex-1 h-px ${isHighlighted ? 'bg-agro-gold/30' : 'bg-agro-gold/30'}`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.slice(0, 3).map((item) => (
          <NewsCard
            key={item.id}
            title={item.title}
            summary={item.summary}
            imageUrl={item.imageUrl}
            articleUrl={item.articleUrl}
            source={item.source}
            pubDate={item.pubDate}
          />
        ))}
      </div>
    </section>
  );
};

export default NewsCategory;
