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
    <div className="glass-panel p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold font-heading text-agro-gold flex items-center gap-2">
          <DollarSign className="w-5 h-5 flex-shrink-0" />
          Cotações
        </h2>
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          <span className="font-semibold">Fonte:</span> CEPEA/ESALQ (Notícias Agrícolas) e ICE NY
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
        {(quotes as Quote[]).map((quote) => (
          <div
            key={quote.name}
            className="glass-card quote-card flex flex-col items-center justify-center text-center p-2 sm:p-3 rounded-lg transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <span className="text-agro-gold-light">{iconMap[quote.name] || <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}</span>
              <span className={`font-medium text-muted-foreground ${quote.name.includes('Café') ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'}`}>{quote.name}</span>
            </div>
            {quote.name === 'Café ICE NY' && (
              <span className="text-[9px] sm:text-[10px] text-muted-foreground/70 mb-1 sm:mb-2">Ref. Internacional</span>
            )}
            {quote.name === 'Café CEPEA/ESALQ' && (
              <span className="text-[9px] sm:text-[10px] text-muted-foreground/70 mb-1 sm:mb-2">Mercado Físico BR</span>
            )}
            {quote.name !== 'Café ICE NY' && quote.name !== 'Café CEPEA/ESALQ' && (
              <div className="mb-1 sm:mb-2" />
            )}
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold text-foreground">{quote.value}</span>
              <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs ${quote.change >= 0 ? 'quote-positive' : 'quote-negative'}`}>
                {quote.change >= 0 ? (
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
