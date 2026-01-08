import { useState, useEffect, useCallback } from "react";
import { ExternalLink, Calendar, Newspaper, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
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

interface CarouselCategoryProps {
    title: string;
    icon?: LucideIcon;
    news: NewsItem[];
    autoRotateMs?: number;
    variant?: 'gold' | 'green';
    categoryId?: string;
}

// Category-specific fallback images (agriculture themed)
const FALLBACK_IMAGES: Record<string, string> = {
    'cooxupe': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop', // Coffee beans
    'inovacao-agro': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop', // Technology/innovation
    'default': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop' // Green field
};

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

const CarouselCategory = ({
    title,
    icon: Icon = Trophy,
    news,
    autoRotateMs = 5000,
    variant = 'gold',
    categoryId = 'default'
}: CarouselCategoryProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

    // Use exactly 4 items
    const displayNews = news.slice(0, 4);
    const maxIndex = displayNews.length - 1;

    // Auto-rotate effect
    useEffect(() => {
        if (isPaused || displayNews.length <= 1) return;

        const interval = setInterval(() => {
            handleIndexChange((activeIndex >= maxIndex ? 0 : activeIndex + 1), 'left');
        }, autoRotateMs);

        return () => clearInterval(interval);
    }, [isPaused, maxIndex, autoRotateMs, displayNews.length, activeIndex]);

    const handleIndexChange = useCallback((newIndex: number, direction: 'left' | 'right') => {
        setSlideDirection(direction);
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveIndex(newIndex);
            setTimeout(() => setIsTransitioning(false), 100);
        }, 400);
    }, []);

    const goToPrev = useCallback(() => {
        handleIndexChange(activeIndex <= 0 ? maxIndex : activeIndex - 1, 'right');
    }, [maxIndex, activeIndex, handleIndexChange]);

    const goToNext = useCallback(() => {
        handleIndexChange(activeIndex >= maxIndex ? 0 : activeIndex + 1, 'left');
    }, [maxIndex, activeIndex, handleIndexChange]);

    const goToIndex = useCallback((index: number) => {
        if (index !== activeIndex) {
            const direction = index > activeIndex ? 'left' : 'right';
            handleIndexChange(index, direction);
        }
    }, [activeIndex, handleIndexChange]);

    const activeNews = displayNews[activeIndex];
    const isGold = variant === 'gold';

    // Border color based on variant (subtle opacity)
    const borderColor = isGold ? 'border-agro-gold/50' : 'border-emerald-400/50';
    const borderColorMuted = isGold ? 'border-agro-gold/30' : 'border-emerald-400/30';

    if (!activeNews || displayNews.length === 0) return null;

    return (
        <section
            className="animate-fade-in glass-panel p-3 sm:p-5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Header with navigation - wrap on mobile */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className={`p-1.5 sm:p-2 rounded-lg border ${isGold
                    ? 'bg-agro-gold/20 border-agro-gold/30'
                    : 'bg-emerald-500/20 border-emerald-500/30'
                    }`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isGold ? 'text-agro-gold' : 'text-emerald-400'}`} />
                </div>
                <h2 className={`text-base sm:text-xl lg:text-2xl font-bold font-heading ${isGold ? 'text-agro-gold' : 'text-emerald-400'
                    }`}>
                    {title}
                </h2>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Navigation controls */}
                <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                    <button
                        onClick={goToPrev}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-agro-gold/50 bg-transparent flex items-center justify-center transition-all duration-200 hover:border-agro-gold hover:bg-agro-gold/10"
                        aria-label="Notícia anterior"
                    >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-agro-gold" />
                    </button>

                    {/* Dots indicator */}
                    <div className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2">
                        {displayNews.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToIndex(i)}
                                className={`transition-all duration-300 rounded-full ${i === activeIndex
                                    ? `w-4 sm:w-6 h-1.5 sm:h-2 ${isGold ? 'bg-agro-gold' : 'bg-emerald-400'}`
                                    : `w-1.5 sm:w-2 h-1.5 sm:h-2 ${isGold ? 'bg-agro-gold/30' : 'bg-emerald-400/30'} hover:opacity-70`
                                    }`}
                                aria-label={`Ir para notícia ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={goToNext}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-agro-gold/50 bg-transparent flex items-center justify-center transition-all duration-200 hover:border-agro-gold hover:bg-agro-gold/10"
                        aria-label="Próxima notícia"
                    >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-agro-gold" />
                    </button>
                </div>
            </div>

            {/* Main Card - Large with gold border - NO glass-card to avoid glow bleeding */}
            <div className={`backdrop-blur-lg rounded-lg overflow-hidden mb-4 border ${borderColor} transition-all duration-300 bg-[hsl(140_30%_10%/0.4)]`}>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Image with transition */}
                    <div className="relative h-64 lg:h-80 overflow-hidden">
                        <img
                            key={activeNews.id}
                            src={activeNews.imageUrl || FALLBACK_IMAGES[categoryId] || FALLBACK_IMAGES['default']}
                            alt={activeNews.title}
                            className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${isTransitioning
                                ? `opacity-0 ${slideDirection === 'left' ? '-translate-x-8' : 'translate-x-8'}`
                                : 'opacity-100 translate-x-0'
                                }`}
                            onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.dataset.fallback) {
                                    target.dataset.fallback = 'true';
                                    target.src = FALLBACK_IMAGES[categoryId] || FALLBACK_IMAGES['default'];
                                }
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* Content with slide transition */}
                    <div className={`p-6 flex flex-col justify-center transition-all duration-500 ease-in-out ${isTransitioning
                        ? `opacity-0 ${slideDirection === 'left' ? '-translate-x-8' : 'translate-x-8'}`
                        : 'opacity-100 translate-x-0'
                        }`}>
                        <h3 className={`text-xl lg:text-2xl font-bold font-heading mb-4 leading-tight ${isGold ? 'text-agro-gold' : 'text-emerald-400'
                            }`}>
                            {activeNews.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-4">
                            {activeNews.summary}
                        </p>
                        <div className={`flex items-center gap-4 text-sm mb-4 ${isGold ? 'text-agro-gold-light' : 'text-emerald-300'
                            }`}>
                            {activeNews.source && (
                                <div className="flex items-center gap-1">
                                    <Newspaper className="w-4 h-4" />
                                    <span>{activeNews.source}</span>
                                </div>
                            )}
                            {activeNews.pubDate && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(activeNews.pubDate)}</span>
                                </div>
                            )}
                        </div>
                        <a
                            href={activeNews.articleUrl}
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

            {/* Thumbnails Grid - All 4 cards, selected one has gold border */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {displayNews.map((item, index) => {
                    const isSelected = index === activeIndex;

                    return (
                        <button
                            key={item.id}
                            onClick={() => goToIndex(index)}
                            className={`relative aspect-video rounded-lg overflow-hidden transition-all duration-300 ${isSelected
                                ? `border-2 ${borderColor} scale-[1.02] opacity-100`
                                : `border-0 grayscale-[30%] opacity-50 hover:opacity-75`
                                }`}
                            style={{ boxShadow: 'none', outline: 'none' }}
                        >
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    if (!target.dataset.fallback) {
                                        target.dataset.fallback = 'true';
                                        target.src = FALLBACK_IMAGES[categoryId] || FALLBACK_IMAGES['default'];
                                    }
                                }}
                            />
                            <div className={`absolute inset-0 ${isSelected
                                ? 'bg-gradient-to-t from-black/50 via-transparent to-transparent'
                                : 'bg-gradient-to-t from-black/70 via-black/30 to-black/10'
                                }`} />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h4 className={`text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-tight ${isSelected ? '' : 'opacity-80'
                                    }`}>
                                    {item.title}
                                </h4>
                            </div>
                            {/* Selected indicator dot */}
                            {isSelected && (
                                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${isGold ? 'bg-agro-gold' : 'bg-emerald-400'
                                    }`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default CarouselCategory;
