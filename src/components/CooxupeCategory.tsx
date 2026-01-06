import { ExternalLink, Calendar, Newspaper, Trophy } from "lucide-react";

interface NewsItem {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    articleUrl: string;
    source?: string;
    pubDate?: string;
}

interface CooxupeCategoryProps {
    title: string;
    news: NewsItem[];
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [, year, month, day] = match;
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    } catch {
        return dateStr;
    }
};

const CooxupeCategory = ({ title, news }: CooxupeCategoryProps) => {
    // Sort news by date (most recent first) to ensure featured card has the latest news
    const sortedNews = [...news].sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA;
    });

    const featuredNews = sortedNews[0];
    const secondaryNews = sortedNews.slice(1, 4);

    return (
        <section className="animate-fade-in category-highlight">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-agro-gold/20 border border-agro-gold/30">
                    <Trophy className="w-6 h-6 text-agro-gold" />
                </div>
                <h2 className="category-title category-title-highlight">{title}</h2>
                <div className="flex-1 h-px bg-agro-gold/30" />
            </div>

            {/* Featured Card - Large */}
            {featuredNews && (
                <div className="glass-card cooxupe-featured-card mb-6 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image */}
                        <div className="relative h-64 lg:h-80 overflow-hidden">
                            <img
                                src={featuredNews.imageUrl}
                                alt={featuredNews.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1599825407615-a1ee8e6a0e8b?w=800&h=600&fit=crop';
                                }}
                            />
                        </div>
                        {/* Content */}
                        <div className="p-6 flex flex-col justify-center">
                            <h3 className="text-xl lg:text-2xl font-bold font-heading text-agro-gold mb-4 leading-tight">
                                {featuredNews.title}
                            </h3>
                            <p className="text-muted-foreground mb-4 line-clamp-4">
                                {featuredNews.summary}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-agro-gold-light mb-4">
                                {featuredNews.source && (
                                    <div className="flex items-center gap-1">
                                        <Newspaper className="w-4 h-4" />
                                        <span>{featuredNews.source}</span>
                                    </div>
                                )}
                                {featuredNews.pubDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(featuredNews.pubDate)}</span>
                                    </div>
                                )}
                            </div>
                            <a
                                href={featuredNews.articleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-gold inline-flex items-center justify-center gap-2 text-sm w-fit"
                            >
                                <span>Ler mais</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Secondary Cards - Compact Horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {secondaryNews.map((item) => (
                    <div key={item.id} className="glass-card cooxupe-secondary-card overflow-hidden">
                        <div className="flex gap-3 p-3">
                            {/* Small Image */}
                            <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1599825407615-a1ee8e6a0e8b?w=200&h=150&fit=crop';
                                    }}
                                />
                            </div>
                            {/* Content */}
                            <div className="flex flex-col flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 leading-tight">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-agro-gold-light mb-3">
                                    {item.source && (
                                        <div className="flex items-center gap-1">
                                            <Newspaper className="w-3 h-3" />
                                            <span>{item.source}</span>
                                        </div>
                                    )}
                                    {item.pubDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(item.pubDate)}</span>
                                        </div>
                                    )}
                                </div>
                                <a
                                    href={item.articleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-gold inline-flex items-center gap-1 text-xs py-1.5 px-3 w-fit mt-auto"
                                >
                                    <span>Ler mais</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CooxupeCategory;
