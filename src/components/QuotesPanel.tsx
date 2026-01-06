import { TrendingUp, TrendingDown, DollarSign, Coffee, Wheat, Leaf, Beef, Milk } from "lucide-react";
import { useQuotesData } from "@/hooks/useDataUpdates";

// Map quote names to icons
const iconMap: Record<string, React.ReactNode> = {
  "Dólar": <DollarSign className="w-5 h-5" />,
  "Café ICE NY": <Coffee className="w-5 h-5" />,
  "Café CEPEA/ESALQ": <Coffee className="w-5 h-5" />,
  "Milho": <Wheat className="w-5 h-5" />,
  "Soja": <Leaf className="w-5 h-5" />,
  "Boi Gordo": <Beef className="w-5 h-5" />,
  "Leite": <Milk className="w-5 h-5" />
};

// Type definitions for quotes
interface Quote {
  name: string;
  value: string;
  change: number;
}

const QuotesPanel = () => {
  const { quotes, loading, error } = useQuotesData();

  if (loading) {
    return (
      <div className="glass-panel p-4">
        <h2 className="text-lg font-semibold font-heading text-agro-gold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Cotações
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Carregando cotações...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-4">
        <h2 className="text-lg font-semibold font-heading text-agro-gold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Cotações
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-heading text-agro-gold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Cotações
        </h2>
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold">Fonte:</span> CEPEA/ESALQ, ICE NY e Notícias Agrícolas
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {(quotes as Quote[]).map((quote) => (
          <div
            key={quote.name}
            className="quote-card flex flex-col items-center justify-center text-center p-3 rounded-lg bg-secondary/50 border border-border/50 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-agro-gold-light">{iconMap[quote.name] || <DollarSign className="w-5 h-5" />}</span>
              <span className={`font-medium text-muted-foreground ${quote.name.includes('Café') ? 'text-xs' : 'text-sm'}`}>{quote.name}</span>
            </div>
            {quote.name === 'Café ICE NY' && (
              <span className="text-[10px] text-muted-foreground/70 mb-2">Ref. Internacional</span>
            )}
            {quote.name === 'Café CEPEA/ESALQ' && (
              <span className="text-[10px] text-muted-foreground/70 mb-2">Mercado Físico BR</span>
            )}
            {quote.name !== 'Café ICE NY' && quote.name !== 'Café CEPEA/ESALQ' && (
              <div className="mb-2" />
            )}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold text-foreground">{quote.value}</span>
              <div className={`flex items-center gap-1 text-xs ${quote.change >= 0 ? 'quote-positive' : 'quote-negative'}`}>
                {quote.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuotesPanel;
