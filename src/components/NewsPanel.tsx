import { Newspaper, Shield, Leaf, Tractor, Wheat, Beef, Milk, Coffee } from "lucide-react";
import NewsCategory from "./NewsCategory";
import CooxupeCategory from "./CooxupeCategory";
import { LucideIcon } from "lucide-react";
import { useNewsData } from "@/hooks/useDataUpdates";

// Map category IDs to icons
const iconMap: Record<string, LucideIcon> = {
    'cooxupe': Coffee,
    'defensivos': Shield,
    'fertilizantes': Leaf,
    'maquinas-irrigacao': Tractor,
    'graos': Wheat,
    'gado-corte': Beef,
    'leite': Milk
};

const NewsPanel = () => {
    const { categories, loading, error } = useNewsData();

    if (loading) {
        return (
            <div className="glass-panel p-4">
                <h2 className="text-lg font-semibold font-heading text-agro-gold mb-4 flex items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    Notícias do Agronegócio
                </h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-pulse text-muted-foreground">Carregando notícias...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel p-4">
                <h2 className="text-lg font-semibold font-heading text-agro-gold mb-4 flex items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    Notícias do Agronegócio
                </h2>
                <div className="flex items-center justify-center py-8">
                    <div className="text-red-400">{error}</div>
                </div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="glass-panel p-4">
                <h2 className="text-lg font-semibold font-heading text-agro-gold mb-4 flex items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    Notícias do Agronegócio
                </h2>
                <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Nenhuma notícia disponível no momento.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {categories.map((category, index) => (
                <div
                    key={category.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    {category.id === 'cooxupe' ? (
                        <CooxupeCategory
                            title={category.title}
                            news={category.news}
                        />
                    ) : (
                        <NewsCategory
                            title={category.title}
                            icon={iconMap[category.id] || Newspaper}
                            news={category.news}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default NewsPanel;

