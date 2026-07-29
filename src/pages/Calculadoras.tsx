import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import bgPattern from "@/assets/agro-wheat-bg.jpg";
import { 
  Calculator, 
  Coffee, 
  Wheat, 
  Leaf, 
  HelpCircle, 
  Scale, 
  Activity, 
  Sparkles,
  FileText
} from "lucide-react";

interface PrintData {
  title: string;
  inputs: Array<{ label: string; value: string }>;
  results: Array<{ label: string; value: string }>;
  formula: string;
  guidelines: string[];
}

const Calculadoras = () => {
  // --- TABS CONTROL ---
  const [activeTab, setActiveTab] = useState<"calagem" | "safra" | "conversor">("calagem");

  // --- PRINT STATE ---
  const [printData, setPrintData] = useState<PrintData | null>(null);

  const triggerPrint = (data: PrintData) => {
    setPrintData(data);
    // Pequeno delay para garantir que o estado renderizou no HTML antes do print do navegador
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // --- STATE FOR CALAGEM ---
  const [v1, setV1] = useState<string>("35"); // Saturação atual
  const [v2, setV2] = useState<string>("70"); // Saturação desejada
  const [ctc, setCtc] = useState<string>("8.5"); // CTC
  const [prnt, setPrnt] = useState<string>("80"); // PRNT
  const [calagemResult, setCalagemResult] = useState<number | null>(null);

  const handleCalagemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numV1 = parseFloat(v1);
    const numV2 = parseFloat(v2);
    const numCtc = parseFloat(ctc);
    const numPrnt = parseFloat(prnt);

    if (numV2 > numV1 && numCtc > 0 && numPrnt > 0) {
      // Fórmula: NC = ((V2 - V1) * CTC) / PRNT
      const result = ((numV2 - numV1) * numCtc) / numPrnt;
      setCalagemResult(parseFloat(result.toFixed(2)));
    } else {
      setCalagemResult(0);
    }
  };

  // --- STATE FOR SAFRA ---
  const [safraType, setSafraType] = useState<"soja" | "milho" | "cafe">("soja");
  
  // Soja inputs
  const [sojaPlantas, setSojaPlantas] = useState<string>("32"); // plantas/m²
  const [sojaVagens, setSojaVagens] = useState<string>("45"); // vagens/planta
  const [sojaGraos, setSojaGraos] = useState<string>("2.6"); // grãos/vagem
  const [sojaPms, setSojaPms] = useState<string>("165"); // peso mil grãos (g)

  // Milho inputs
  const [milhoEspacamento, setMilhoEspacamento] = useState<string>("0.5"); // espaçamento entre linhas (m)
  const [milhoEspigas, setMilhoEspigas] = useState<string>("5"); // espigas/metro linear
  const [milhoFileiras, setMilhoFileiras] = useState<string>("16"); // fileiras/espiga
  const [milhoGraosFileira, setMilhoGraosFileira] = useState<string>("36"); // grãos/fileira
  const [milhoPms, setMilhoPms] = useState<string>("320"); // peso mil grãos (g)

  // Café inputs
  const [cafeLinha, setCafeLinha] = useState<string>("3.5"); // espaçamento entre linhas (m)
  const [cafePlanta, setCafePlanta] = useState<string>("0.75"); // espaçamento entre plantas (m)
  const [cafeProducao, setCafeProducao] = useState<string>("4.5"); // produção média (litros/planta)
  const [cafeRendimento, setCafeRendimento] = useState<string>("480"); // rendimento (litros de café da roça/saca beneficiada)

  const [safraResult, setSafraResult] = useState<{
    scHa: number;
    tonTotal: number;
    populacao?: number;
  } | null>(null);

  const handleSafraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (safraType === "soja") {
      const p = parseFloat(sojaPlantas);
      const v = parseFloat(sojaVagens);
      const g = parseFloat(sojaGraos);
      const pms = parseFloat(sojaPms);
      
      if (p > 0 && v > 0 && g > 0 && pms > 0) {
        // Fórmula Soja correta: (Plantas/m² * Vagens/planta * Grãos/vagem * PMS) / 6000
        const scHa = (p * v * g * pms) / 6000;
        const tonHa = (scHa * 60) / 1000;
        setSafraResult({
          scHa: parseFloat(scHa.toFixed(1)),
          tonTotal: parseFloat(tonHa.toFixed(2))
        });
      }
    } else if (safraType === "milho") {
      const esp = parseFloat(milhoEspacamento);
      const espig = parseFloat(milhoEspigas);
      const fil = parseFloat(milhoFileiras);
      const gf = parseFloat(milhoGraosFileira);
      const pms = parseFloat(milhoPms);

      if (esp > 0 && espig > 0 && fil > 0 && gf > 0 && pms > 0) {
        // População por ha = (10000 / Espaçamento) * Espigas/metro
        const populacao = (10000 / esp) * espig;
        // Grãos por ha = População * Fileiras * Grãos/fileira
        const graosHa = populacao * fil * gf;
        // Peso total (g) = (GraosHa / 1000) * PMS
        // Peso total (kg) = Peso total (g) / 1000
        const kgHa = (graosHa / 1000000) * pms;
        const scHa = kgHa / 60;
        const tonHa = kgHa / 1000;

        setSafraResult({
          scHa: parseFloat(scHa.toFixed(1)),
          tonTotal: parseFloat(tonHa.toFixed(2)),
          populacao: Math.round(populacao)
        });
      }
    } else if (safraType === "cafe") {
      const el = parseFloat(cafeLinha);
      const ep = parseFloat(cafePlanta);
      const prod = parseFloat(cafeProducao);
      const rend = parseFloat(cafeRendimento);

      if (el > 0 && ep > 0 && prod > 0 && rend > 0) {
        // População por ha = 10000 / (el * ep)
        const populacao = 10000 / (el * ep);
        // Total litros = População * producao/planta
        const totalLitros = populacao * prod;
        // Sacas por ha = Total litros / rendimento
        const scHa = totalLitros / rend;
        const tonHa = (scHa * 60) / 1000;

        setSafraResult({
          scHa: parseFloat(scHa.toFixed(1)),
          tonTotal: parseFloat(tonHa.toFixed(2)),
          populacao: Math.round(populacao)
        });
      }
    }
  };

  // --- STATE FOR CONVERSOR ---
  const [convType, setConvType] = useState<string>("ha-alqueire");
  const [convValue, setConvValue] = useState<string>("25");
  const [convResult, setConvResult] = useState<{
    val1: number;
    unit1: string;
    val2: number;
    unit2: string;
    detail?: string;
  } | null>(null);

  const handleConversorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(convValue);
    if (isNaN(val)) return;

    if (convType === "ha-alqueire") {
      // 1 Alqueire Paulista = 2.42 Hectares
      const result = val / 2.42;
      setConvResult({
        val1: val,
        unit1: "Hectares (ha)",
        val2: parseFloat(result.toFixed(2)),
        unit2: "Alqueires Paulistas",
        detail: "1 Alqueire Paulista = 2,42 Hectares"
      });
    } else if (convType === "alqueire-ha") {
      const result = val * 2.42;
      setConvResult({
        val1: val,
        unit1: "Alqueires Paulistas",
        val2: parseFloat(result.toFixed(2)),
        unit2: "Hectares (ha)",
        detail: "1 Alqueire Paulista = 2,42 Hectares"
      });
    } else if (convType === "scha-bushel") {
      // 1 sc/ha de soja = 0.892 bushels/acre
      const result = val * 0.892;
      setConvResult({
        val1: val,
        unit1: "Sacas/Hectare (sc/ha)",
        val2: parseFloat(result.toFixed(2)),
        unit2: "Bushels/Acre (bu/ac)",
        detail: "Fator de conversão médio para grãos"
      });
    } else if (convType === "bushel-scha") {
      const result = val / 0.892;
      setConvResult({
        val1: val,
        unit1: "Bushels/Acre (bu/ac)",
        val2: parseFloat(result.toFixed(2)),
        unit2: "Sacas/Hectare (sc/ha)",
        detail: "Fator de conversão médio para grãos"
      });
    } else if (convType === "sc-kg") {
      const result = val * 60;
      setConvResult({
        val1: val,
        unit1: "Sacas (60kg)",
        val2: parseFloat(result.toFixed(2)),
        unit2: "Quilogramas (kg)",
        detail: "Saca padrão nacional de 60kg"
      });
    }
  };

  return (
    <>
      {/* Screen Interface Wrapper (Hidden when Printing) */}
      <div className="min-h-screen relative print:hidden">
        {/* Background Image with Overlay */}
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${bgPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-background/85" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />

          {/* Main Content */}
          <main className="container mx-auto px-4 pt-72 sm:pt-56 lg:pt-40 pb-16 flex-grow">
            <div className="max-w-5xl mx-auto">
              
              {/* Page Header */}
              <div className="text-center mb-8 sm:mb-12 animate-in fade-in-50 duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agro-gold/15 border border-agro-gold/30 text-agro-gold text-xs font-semibold mb-3 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  Novas Ferramentas Interativas
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gold-gradient font-heading mb-3">
                  Calculadoras Agrícolas
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                  Realize cálculos de correção do solo, estimativas de produtividade para soja, milho e café, além de conversões rápidas de medidas do agronegócio.
                </p>
              </div>

              {/* Custom Tabs Navigation */}
              <div className="w-full">
                <div className="grid grid-cols-3 mb-8 bg-background/60 border border-border/40 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab("calagem")}
                    className={`rounded-lg py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer ${
                      activeTab === "calagem" 
                        ? "bg-agro-gold text-background shadow animate-in fade-in duration-300" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Calculator className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Calagem do Solo</span>
                    <span className="inline sm:hidden">Calagem</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("safra")}
                    className={`rounded-lg py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer ${
                      activeTab === "safra" 
                        ? "bg-agro-gold text-background shadow animate-in fade-in duration-300" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Activity className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Estimativa de Safra</span>
                    <span className="inline sm:hidden">Safra</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("conversor")}
                    className={`rounded-lg py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer ${
                      activeTab === "conversor" 
                        ? "bg-agro-gold text-background shadow animate-in fade-in duration-300" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Scale className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Conversor de Medidas</span>
                    <span className="inline sm:hidden">Conversor</span>
                  </button>
                </div>

                {/* TAB 1: CALAGEM */}
                {activeTab === "calagem" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                      {/* Form */}
                      <div className="lg:col-span-7 glass-panel p-6 sm:p-8 flex flex-col justify-between">
                        <form onSubmit={handleCalagemSubmit} className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-agro-gold/10 border border-agro-gold/20 flex items-center justify-center text-agro-gold">
                              <Calculator className="w-5 h-5" />
                            </div>
                            <div>
                              <h2 className="text-lg font-bold text-foreground">Necessidade de Calagem (NC)</h2>
                              <p className="text-xs text-muted-foreground">Método de Saturação por Bases</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-muted-foreground">Saturação por Bases Atual (V1 %)</label>
                              <input 
                                type="number" 
                                step="any"
                                value={v1} 
                                onChange={(e) => setV1(e.target.value)}
                                className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all"
                                placeholder="Ex: 35"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-muted-foreground">Saturação por Bases Desejada (V2 %)</label>
                              <input 
                                type="number" 
                                step="any"
                                value={v2} 
                                onChange={(e) => setV2(e.target.value)}
                                className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all"
                                placeholder="Ex: 70"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-muted-foreground">Capacidade de Troca Catiônica (CTC)</label>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  step="any"
                                  value={ctc} 
                                  onChange={(e) => setCtc(e.target.value)}
                                  className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all pr-20"
                                  placeholder="Ex: 8.5"
                                  required
                                />
                                <span className="absolute right-3 top-2 text-[10px] text-muted-foreground pointer-events-none">cmol(c)/dm³</span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-muted-foreground">PRNT do Calcário (%)</label>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  step="any"
                                  value={prnt} 
                                  onChange={(e) => setPrnt(e.target.value)}
                                  className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all pr-12"
                                  placeholder="Ex: 80"
                                  required
                                />
                                <span className="absolute right-3 top-2 text-[10px] text-muted-foreground pointer-events-none">%</span>
                              </div>
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-agro-gold text-background hover:bg-agro-gold-light active:scale-98 transition-all py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mt-6 cursor-pointer"
                          >
                            Calcular Recomendação
                          </button>
                        </form>

                        {/* Explanatory notes */}
                        <div className="mt-6 pt-6 border-t border-border/40 flex gap-2.5 text-xs text-muted-foreground">
                          <HelpCircle className="w-4 h-4 text-agro-gold flex-shrink-0 mt-0.5" />
                          <p>
                            A fórmula calcula a quantidade de calcário necessária por hectare em toneladas. O objetivo é elevar a saturação de bases (pH e nutrientes) da camada arável do solo para a meta recomendada da cultura desejada.
                          </p>
                        </div>
                      </div>

                      {/* Results Panel */}
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="glass-panel p-6 sm:p-8 flex-grow flex flex-col justify-between border-agro-gold/30 bg-agro-gold/5">
                          <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Recomendação Resultante</h3>
                            {calagemResult !== null ? (
                              <div className="space-y-4 animate-in fade-in duration-300">
                                <div>
                                  <div className="text-5xl font-black text-gold-gradient font-heading">
                                    {calagemResult}
                                  </div>
                                  <div className="text-sm font-medium text-foreground mt-1">Toneladas de Calcário por Hectare (t/ha)</div>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => triggerPrint({
                                    title: "Laudo de Recomendação de Calagem do Solo",
                                    inputs: [
                                      { label: "Saturação por Bases Atual (V1)", value: `${v1}%` },
                                      { label: "Saturação por Bases Desejada (V2)", value: `${v2}%` },
                                      { label: "Capacidade de Troca Catiônica (CTC)", value: `${ctc} cmol(c)/dm³` },
                                      { label: "PRNT do Calcário", value: `${prnt}%` }
                                    ],
                                    results: [
                                      { label: "Necessidade de Calagem (NC)", value: `${calagemResult} t/ha` }
                                    ],
                                    formula: "NC (t/ha) = [(V2 - V1) × CTC] / PRNT",
                                    guidelines: [
                                      "Se o resultado for maior que 4 t/ha, recomenda-se parcelar a aplicação em duas vezes (metade antes da aração, metade antes da gradagem).",
                                      "Aplicar com antecedência de 60 a 90 dias antes do plantio para reação do corretivo.",
                                      "Garantir a incorporação uniforme do calcário na camada de 0 a 20 cm do solo."
                                    ]
                                  })}
                                  className="w-full bg-background/55 hover:bg-agro-gold/15 border border-agro-gold/45 text-agro-gold hover:text-agro-gold-light active:scale-98 transition-all py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
                                >
                                  <FileText className="w-4 h-4 flex-shrink-0" />
                                  Exportar Laudo (PDF)
                                </button>

                                <div className="bg-background/40 p-4 rounded-lg border border-border/30 text-xs space-y-2">
                                  <p className="font-semibold text-foreground">Orientações de Aplicação:</p>
                                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                    <li>Se o resultado for maior que 4 t/ha, recomenda-se parcelar a aplicação.</li>
                                    <li>Aplicar com antecedência de 60 a 90 dias antes do plantio para reação do corretivo.</li>
                                    <li>Garantir a incorporação uniforme do calcário na camada de 0 a 20 cm do solo.</li>
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Calculator className="w-12 h-12 stroke-[1.2] mb-3 text-muted-foreground/55" />
                                <p className="text-xs">Insira os dados da análise de solo no formulário ao lado e clique em calcular.</p>
                              </div>
                            )}
                          </div>

                          {calagemResult !== null && (
                            <div className="text-[10px] text-muted-foreground italic text-center mt-6">
                              Fórmula utilizada: NC (t/ha) = ((V2 - V1) * CTC) / PRNT
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Educational Block */}
                    <div className="glass-panel p-6 sm:p-8 animate-in fade-in-30 duration-700">
                      <h3 className="text-base font-bold text-agro-gold mb-3 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-agro-gold" />
                        Como funciona a Recomendação de Calagem?
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        A calagem é uma prática essencial para corrigir a acidez do solo e fornecer nutrientes como Cálcio (Ca) e Magnésio (Mg). O método utilizado nesta calculadora é a <strong>Saturação por Bases</strong>, amplamente adotado no Brasil por relacionar diretamente o equilíbrio químico do solo com a necessidade das culturas.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground mt-4">
                        <div className="bg-background/40 p-4 rounded-lg border border-border/30">
                          <p className="font-semibold text-foreground mb-1">Passo a Passo do Produtor:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Faça uma coleta de solo homogênea da área produtiva (geralmente na profundidade de 0 a 20 cm).</li>
                            <li>Identifique os valores de <strong>V% atual (Saturação por Bases)</strong> e a <strong>CTC total</strong> no laudo do laboratório de análises de solo.</li>
                            <li>Defina a <strong>meta de V% (V2)</strong> de acordo com a cultura (geralmente 70% para a maioria dos grãos e 60% para pastagens).</li>
                          </ul>
                        </div>
                        <div className="bg-background/40 p-4 rounded-lg border border-border/30">
                          <p className="font-semibold text-foreground mb-1">A Equação Agronômica:</p>
                          <p className="text-center py-2 text-sm text-agro-gold font-bold font-mono">NC (t/ha) = [(V2 - V1) × CTC] / PRNT</p>
                          <p className="text-[10px] leading-relaxed mt-1">
                            O **PRNT (Poder Relativo de Neutralização Total)** representa a qualidade do calcário comprado. Calcários com PRNT maior são mais finos e reagem mais rapidamente, exigindo menor quantidade física de produto no campo.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SAFRA */}
                {activeTab === "safra" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                      {/* Form */}
                      <div className="lg:col-span-7 glass-panel p-6 sm:p-8 flex flex-col justify-between">
                        <form onSubmit={handleSafraSubmit} className="space-y-4">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-agro-gold/10 border border-agro-gold/20 flex items-center justify-center text-agro-gold">
                              <Activity className="w-5 h-5" />
                            </div>
                            <div>
                              <h2 className="text-lg font-bold text-foreground">Estimativa de Produtividade da Safra</h2>
                              <p className="text-xs text-muted-foreground">Selecione a cultura e insira os dados do campo</p>
                            </div>
                          </div>

                          {/* Cultivos Toggle */}
                          <div className="grid grid-cols-3 gap-2 p-1 bg-background/50 rounded-lg border border-border/50 mb-6">
                            <button
                              type="button"
                              onClick={() => { setSafraType("soja"); setSafraResult(null); }}
                              className={`py-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${safraType === "soja" ? "bg-agro-gold text-background shadow" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              <Leaf className="w-3.5 h-3.5 flex-shrink-0" />
                              Soja
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSafraType("milho"); setSafraResult(null); }}
                              className={`py-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${safraType === "milho" ? "bg-agro-gold text-background shadow" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              <Wheat className="w-3.5 h-3.5 flex-shrink-0" />
                              Milho
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSafraType("cafe"); setSafraResult(null); }}
                              className={`py-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${safraType === "cafe" ? "bg-agro-gold text-background shadow" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              <Coffee className="w-3.5 h-3.5 flex-shrink-0" />
                              Café
                            </button>
                          </div>

                          {/* SOJA FORM */}
                          {safraType === "soja" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">População de Plantas (plantas/m²)</label>
                                <input 
                                  type="number" 
                                  step="any"
                                  value={sojaPlantas} 
                                  onChange={(e) => setSojaPlantas(e.target.value)}
                                  className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all"
                                  placeholder="Ex: 32"
                                  required
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Média de Vagens por Planta</label>
                                <input 
                                  type="number" 
                                  step="any"
                                  value={sojaVagens} 
                                  onChange={(e) => setSojaVagens(e.target.value)}
                                  className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all"
                                  placeholder="Ex: 45"
                                  required
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Média de Grãos por Vagem</label>
                                <input 
                                  type="number" 
                                  step="any"
                                  value={sojaGraos} 
                                  onChange={(e) => setSojaGraos(e.target.value)}
                                  className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all"
                                  placeholder="Ex: 2.6"
                                  required
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Peso de Mil Grãos (PMS - gramas)</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    step="any"
                                    value={sojaPms} 
                                    onChange={(e) => setSojaPms(e.target.value)}
                                    className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all pr-16"
                                    placeholder="Ex: 165"
                                    required
                                  />
                                  <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground pointer-events-none">gramas</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* MILHO FORM */}
                          {safraType === "milho" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Espaçamento entre Linhas (m)</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    step="any"
                                    value={milhoEspacamento} 
                                    onChange={(e) => setMilhoEspacamento(e.target.value)}
                                    className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all pr-14"
                                    placeholder="Ex: 0.5"
                                    required
                                  />
                                  <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground pointer-events-none">metros</span>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Espigas por Metro Linear (m)</label>
                                <input 
                                  type="number" 
                                  step="any"
                                  value={milhoEspigas} 
                                  onChange={(e) => setMilhoEspigas(e.target.value)}
                                  className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all"
                                  placeholder="Ex: 5"
                                  required
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Média de Fileiras por Espiga</label>
                                <input 
                                  type="number" 
                                  step="any"
                                  value={milhoFileiras} 
                                  onChange={(e) => setMilhoFileiras(e.target.value)}
                                  className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all"
                                  placeholder="Ex: 16"
                                  required
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Média de Grãos por Fileira</label>
                                <input 
                                  type="number" 
                                  step="any"
                                  value={milhoGraosFileira} 
                                  onChange={(e) => setMilhoGraosFileira(e.target.value)}
                                  className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all"
                                  placeholder="Ex: 36"
                                  required
                                />
                              </div>
                              <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-semibold text-muted-foreground">Peso de Mil Grãos (PMS - gramas)</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    step="any"
                                    value={milhoPms} 
                                    onChange={(e) => setMilhoPms(e.target.value)}
                                    className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all pr-16"
                                    placeholder="Ex: 320"
                                    required
                                  />
                                  <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground pointer-events-none">gramas</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* CAFÉ FORM */}
                          {safraType === "cafe" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Espaçamento entre Linhas (m)</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    step="any"
                                    value={cafeLinha} 
                                    onChange={(e) => setCafeLinha(e.target.value)}
                                    className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all pr-14"
                                    placeholder="Ex: 3.5"
                                    required
                                  />
                                  <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground pointer-events-none">metros</span>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Espaçamento entre Plantas (m)</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    step="any"
                                    value={cafePlanta} 
                                    onChange={(e) => setCafePlanta(e.target.value)}
                                    className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all pr-14"
                                    placeholder="Ex: 0.75"
                                    required
                                  />
                                  <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground pointer-events-none">metros</span>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Produção Média em Litros por Planta</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    step="any"
                                    value={cafeProducao} 
                                    onChange={(e) => setCafeProducao(e.target.value)}
                                    className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all pr-20"
                                    placeholder="Ex: 4.5"
                                    required
                                  />
                                  <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground pointer-events-none">litros/pé</span>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Rendimento da Colheita (Litros por Saca de 60kg)</label>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    step="any"
                                    value={cafeRendimento} 
                                    onChange={(e) => setCafeRendimento(e.target.value)}
                                    className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all pr-20"
                                    placeholder="Ex: 480"
                                    required
                                  />
                                  <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground pointer-events-none">litros/saca</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <button 
                            type="submit"
                            className="w-full bg-agro-gold text-background hover:bg-agro-gold-light active:scale-98 transition-all py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mt-6 cursor-pointer"
                          >
                            Estimar Produtividade
                          </button>
                        </form>

                        {/* Explanatory notes */}
                        <div className="mt-6 pt-6 border-t border-border/40 flex gap-2.5 text-xs text-muted-foreground">
                          <HelpCircle className="w-4 h-4 text-agro-gold flex-shrink-0 mt-0.5" />
                          {safraType === "soja" && (
                            <p>
                              A estimativa para soja utiliza parâmetros de densidade de grãos coletados em amostras de campo (normalmente de 1m linear em múltiplos pontos da área) e o Peso de Mil Sementes comercial para prever a produção.
                            </p>
                          )}
                          {safraType === "milho" && (
                            <p>
                              A produtividade do milho é calculada determinando o número total de grãos na área e aplicando o peso unitário. O espaçamento e as espigas por metro linear determinam a população teórica de espigas/hectare.
                            </p>
                          )}
                          {safraType === "cafe" && (
                            <p>
                              A estimativa do café relaciona o espaçamento de plantio (densidade de plantas por hectare) com o volume em litros colhidos de café "coco" ou "maduro" por planta, convertendo pelo rendimento histórico do beneficiamento da região (médias de 480 a 500 litros de fruto fresco para produzir 1 saca de 60kg limpo).
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Results Panel */}
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="glass-panel p-6 sm:p-8 flex-grow flex flex-col justify-between border-agro-gold/30 bg-agro-gold/5">
                          <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Resultado da Estimativa</h3>
                            {safraResult !== null ? (
                              <div className="space-y-4 animate-in fade-in duration-300">
                                <div>
                                  <div className="text-5xl font-black text-gold-gradient font-heading">
                                    {safraResult.scHa}
                                  </div>
                                  <div className="text-sm font-medium text-foreground mt-1">Sacas de 60kg por Hectare (sc/ha)</div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    let inputsArr = [];
                                    let typeTitle = "";
                                    let form = "";
                                    let guides = [];

                                    if (safraType === "soja") {
                                      typeTitle = "Laudo de Estimativa de Safra - Soja";
                                      form = "Produtividade (sc/ha) = (Plantas/m² * Vagens/planta * Grãos/vagem * PMS) / 6000";
                                      inputsArr = [
                                        { label: "População de Plantas", value: `${sojaPlantas} plantas/m²` },
                                        { label: "Média de Vagens por Planta", value: `${sojaVagens} vagens` },
                                        { label: "Média de Grãos por Vagem", value: `${sojaGraos} grãos` },
                                        { label: "Peso de Mil Grãos (PMS)", value: `${sojaPms} gramas` }
                                      ];
                                      guides = [
                                        "Realize a contagem em pelo menos 10 pontos diferentes da lavoura para obter uma média representativa.",
                                        "O PMS (Peso de Mil Sementes) costuma variar de 130g a 180g dependendo da cultivar e do clima da safra."
                                      ];
                                    } else if (safraType === "milho") {
                                      typeTitle = "Laudo de Estimativa de Safra - Milho";
                                      form = "População/ha = (10000 / Espaçamento) * Espigas/metro | Produtividade = (População * Fileiras * Grãos/fileira * PMS) / 60.000.000";
                                      inputsArr = [
                                        { label: "Espaçamento entre Linhas", value: `${milhoEspacamento} metros` },
                                        { label: "Espigas por Metro Linear", value: `${milhoEspigas} espigas` },
                                        { label: "Média de Fileiras por Espiga", value: `${milhoFileiras} fileiras` },
                                        { label: "Média de Grãos por Fileira", value: `${milhoGraosFileira} grãos` },
                                        { label: "Peso de Mil Grãos (PMS)", value: `${milhoPms} gramas` }
                                      ];
                                      guides = [
                                        "Faça as amostras em espigas representativas de tamanho médio no campo.",
                                        "Descarte espigas com falhas graves na ponta para não inflar artificialmente o cálculo de produtividade."
                                      ];
                                    } else if (safraType === "cafe") {
                                      typeTitle = "Laudo de Estimativa de Safra - Café";
                                      form = "População/ha = 10000 / (Esp. Linhas * Esp. Plantas) | Produtividade (sc/ha) = (População * Litros/planta) / Rendimento";
                                      inputsArr = [
                                        { label: "Espaçamento entre Linhas", value: `${cafeLinha} metros` },
                                        { label: "Espaçamento entre Plantas", value: `${cafePlanta} metros` },
                                        { label: "Produção Média", value: `${cafeProducao} litros/pé` },
                                        { label: "Rendimento", value: `${cafeRendimento} litros/saca` }
                                      ];
                                      guides = [
                                        "Para cafezais em regime de bienalidade, cruze esta estimativa com o histórico produtivo do talhão.",
                                        "Cafés com frutos verdes ou com grãos chochos podem apresentar rendimento menor, exigindo mais litros na colheita."
                                      ];
                                    }

                                    triggerPrint({
                                      title: typeTitle,
                                      inputs: inputsArr,
                                      results: [
                                        { label: "Produtividade Estimada", value: `${safraResult.scHa} sc/ha` },
                                        { label: "Total Equivalente em Toneladas", value: `${safraResult.tonTotal} t/ha` },
                                        ...(safraResult.populacao ? [{ label: "População de Plantas Estimada", value: `${safraResult.populacao.toLocaleString("pt-BR")} plantas/ha` }] : [])
                                      ],
                                      formula: form,
                                      guidelines: guides
                                    });
                                  }}
                                  className="w-full bg-background/55 hover:bg-agro-gold/15 border border-agro-gold/45 text-agro-gold hover:text-agro-gold-light active:scale-98 transition-all py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
                                >
                                  <FileText className="w-4 h-4 flex-shrink-0" />
                                  Exportar Laudo (PDF)
                                </button>

                                <div className="h-px bg-border/40 my-3" />

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Total em Toneladas</span>
                                    <span className="text-lg font-bold text-foreground font-heading">{safraResult.tonTotal} t/ha</span>
                                  </div>
                                  {safraResult.populacao && (
                                    <div>
                                      <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Plantas por Hectare</span>
                                      <span className="text-lg font-bold text-foreground font-heading">{safraResult.populacao.toLocaleString("pt-BR")}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="bg-background/40 p-4 rounded-lg border border-border/30 text-xs space-y-2">
                                  <p className="font-semibold text-foreground">Dicas de Validação:</p>
                                  {safraType === "soja" && (
                                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                      <li>Realize a contagem em pelo menos 10 pontos diferentes da lavoura para obter uma média representativa.</li>
                                      <li>O PMS (Peso de Mil Sementes) costuma variar de 130g a 180g dependendo da cultivar e do clima da safra.</li>
                                    </ul>
                                  )}
                                  {safraType === "milho" && (
                                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                      <li>Faça as amostras em espigas representativas de tamanho médio.</li>
                                      <li>Descarte espigas com falhas graves na ponta para não inflar artificialmente o cálculo.</li>
                                    </ul>
                                  )}
                                  {safraType === "cafe" && (
                                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                      <li>Para cafezais em regime de bienalidade, cruze esta estimativa com o histórico do talhão.</li>
                                      <li>Cafés com frutos verdes ou com grãos chochos podem apresentar rendimento de saca menor (precisando de mais litros colhidos para fechar os 60kg).</li>
                                    </ul>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                {safraType === "soja" && <Leaf className="w-12 h-12 stroke-[1.2] mb-3 text-muted-foreground/55" />}
                                {safraType === "milho" && <Wheat className="w-12 h-12 stroke-[1.2] mb-3 text-muted-foreground/55" />}
                                {safraType === "cafe" && <Coffee className="w-12 h-12 stroke-[1.2] mb-3 text-muted-foreground/55" />}
                                <p className="text-xs">Insira os dados medidos em sua lavoura no formulário e clique em calcular.</p>
                              </div>
                            )}
                          </div>

                          {safraResult !== null && (
                            <div className="text-[10px] text-muted-foreground italic text-center mt-6">
                              *Os valores são estimativos baseados em médias aritméticas e condições ideais de colheita.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Educational Block */}
                    <div className="glass-panel p-6 sm:p-8 animate-in fade-in-30 duration-700">
                      <h3 className="text-base font-bold text-agro-gold mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-agro-gold" />
                        Por que estimar a produtividade antes da colheita?
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        A estimativa de produtividade permite ao produtor planejar com antecedência toda a logística necessária para o escoamento da safra (caminhões, colheitadeiras, sacaria e capacidade de secagem/capacidades de armazenamento). Também é crucial para auxiliar nas decisões de venda antecipada (travamento de preços nas bolsas de mercadorias).
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground mt-4">
                        <div className="bg-background/40 p-4 rounded-lg border border-border/30">
                          <p className="font-semibold text-foreground mb-1">Cultura da Soja:</p>
                          <p className="leading-relaxed">
                            A amostragem de grãos em 1m linear em vários pontos da área estabelece a base. A fórmula usa o **divisor 6000** para converter o peso total de grãos por hectare (a partir do PMS comercial) diretamente no padrão nacional brasileiro de sacas de 60 kg.
                          </p>
                        </div>
                        <div className="bg-background/40 p-4 rounded-lg border border-border/30">
                          <p className="font-semibold text-foreground mb-1">Cultura do Milho:</p>
                          <p className="leading-relaxed">
                            A produtividade é fortemente determinada pelo número de espigas formadas por hectare (calculado com base no espaçamento de plantio). A contagem de grãos por espiga em amostras no campo permite inferir o rendimento total em grãos secos.
                          </p>
                        </div>
                        <div className="bg-background/40 p-4 rounded-lg border border-border/30">
                          <p className="font-semibold text-foreground mb-1">Cultura do Café:</p>
                          <p className="leading-relaxed">
                            Diferente de grãos, a colheita do café baseia-se em volume (litros de café da roça). O cálculo calcula a densidade de covas por hectare e a produção média em litros por pé, convertendo pelo rendimento de beneficiamento da lavoura.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CONVERSOR */}
                {activeTab === "conversor" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                      {/* Form */}
                      <div className="lg:col-span-7 glass-panel p-6 sm:p-8 flex flex-col justify-between">
                        <form onSubmit={handleConversorSubmit} className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-agro-gold/10 border border-agro-gold/20 flex items-center justify-center text-agro-gold">
                              <Scale className="w-5 h-5" />
                            </div>
                            <div>
                              <h2 className="text-lg font-bold text-foreground">Conversor de Unidades Agrícolas</h2>
                              <p className="text-xs text-muted-foreground">Conversões úteis entre o mercado nacional e internacional</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-muted-foreground">Tipo de Conversão</label>
                              <select 
                                value={convType} 
                                onChange={(e) => { setConvType(e.target.value); setConvResult(null); }}
                                className="w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2.5 text-sm text-foreground outline-none transition-all"
                              >
                                <option value="ha-alqueire" className="bg-card">Hectares (ha) para Alqueires Paulistas</option>
                                <option value="alqueire-ha" className="bg-card">Alqueires Paulistas para Hectares (ha)</option>
                                <option value="scha-bushel" className="bg-card">Sacas por Hectare (sc/ha) para Bushels/Acre (bu/ac)</option>
                                <option value="bushel-scha" className="bg-card">Bushels/Acre (bu/ac) para Sacas por Hectare (sc/ha)</option>
                                <option value="sc-kg" className="bg-card">Sacas (60kg) para Quilogramas (kg)</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-muted-foreground">Valor de Entrada</label>
                              <input 
                                type="number" 
                                step="any"
                                value={convValue} 
                                onChange={(e) => setConvValue(e.target.value)}
                                className="no-spinners w-full bg-background/50 border border-border/80 focus:border-agro-gold focus:ring-1 focus:ring-agro-gold rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all"
                                placeholder="Insira o valor..."
                                required
                              />
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-agro-gold text-background hover:bg-agro-gold-light active:scale-98 transition-all py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mt-6 cursor-pointer"
                          >
                            Converter
                          </button>
                        </form>

                        {/* Explanatory notes */}
                        <div className="mt-6 pt-6 border-t border-border/40 flex gap-2.5 text-xs text-muted-foreground">
                          <HelpCircle className="w-4 h-4 text-agro-gold flex-shrink-0 mt-0.5" />
                          <p>
                            Esta ferramenta é muito útil para ler relatórios americanos do USDA (que utilizam Bushels e Acres) e traduzir as produtividades internacionais para a realidade agrícola das sacas brasileiras por hectare.
                          </p>
                        </div>
                      </div>

                      {/* Results Panel */}
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="glass-panel p-6 sm:p-8 flex-grow flex flex-col justify-between border-agro-gold/30 bg-agro-gold/5">
                          <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Resultado da Conversão</h3>
                            {convResult !== null ? (
                              <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{convResult.val1} {convResult.unit1} equivale a</span>
                                  <div className="text-4xl sm:text-5xl font-black text-gold-gradient font-heading leading-tight">
                                    {convResult.val2}
                                  </div>
                                  <span className="text-sm font-semibold text-foreground block">{convResult.unit2}</span>
                                </div>

                                {convResult.detail && (
                                  <div className="bg-background/40 p-4 rounded-lg border border-border/30 text-xs">
                                    <span className="font-semibold text-foreground block mb-1">Nota Técnica:</span>
                                    <p className="text-muted-foreground">{convResult.detail}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Scale className="w-12 h-12 stroke-[1.2] mb-3 text-muted-foreground/55" />
                                <p className="text-xs">Digite o valor no conversor de unidades e clique em Converter.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Educational Block */}
                    <div className="glass-panel p-6 sm:p-8 animate-in fade-in-30 duration-700">
                      <h3 className="text-base font-bold text-agro-gold mb-3 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-agro-gold" />
                        Entendendo as Medidas Internacionais
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        Os grandes mercados agrícolas globais (como as bolsas de Chicago - CBOT e Nova Iorque - ICE) utilizam unidades americanas e imperiais para cotar preços e reportar produtividades. Entender essas relações é crucial para o produtor exportador precificar e negociar.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground mt-4">
                        <div className="bg-background/40 p-4 rounded-lg border border-border/30">
                          <p className="font-semibold text-foreground mb-1">Hectares vs. Alqueires:</p>
                          <p className="leading-relaxed">
                            O Hectare (10.000 m²) é a unidade oficial e científica adotada no Brasil. Contudo, o termo Alqueire ainda é usado regionalmente. O Alqueire Paulista equivale a 2,42 hectares, enquanto o Alqueire Mineiro equivale a 4,84 hectares.
                          </p>
                        </div>
                        <div className="bg-background/40 p-4 rounded-lg border border-border/30">
                          <p className="font-semibold text-foreground mb-1">Sacas/ha vs. Bushels/Acre:</p>
                          <p className="leading-relaxed">
                            O Bushel é uma medida de volume. Para a soja, 1 bushel pesa 27,21 kg. Para o milho, pesa 25,4 kg. A conversão de Bushels/Acre para Sacas/Hectare (multiplicando por aproximadamente 0,892 para soja) traduz a produtividade americana para a linguagem do produtor nacional.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Printable Report Layout (Only visible when printing) */}
      {printData && (
        <div className="hidden print:block bg-white text-black p-12 font-sans min-h-screen">
          {/* Print Header */}
          <div className="border-b-2 border-green-800 pb-4 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-green-800 tracking-tight">PAINEL DO AGRONEGÓCIO</h1>
              <p className="text-xs text-gray-500 font-medium">painelagrofocus.com</p>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-bold text-gray-800 tracking-wide">RELATÓRIO TÉCNICO</h2>
              <p className="text-xs text-gray-500 font-medium">
                Gerado em: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold uppercase text-gray-900 border-b border-gray-300 pb-2 inline-block">
              {printData.title}
            </h3>
          </div>

          {/* Inputs Section */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">1. Dados e Variáveis de Entrada</h4>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-left text-xs font-bold text-gray-700">
                  <th className="border border-gray-300 px-4 py-2">Variável</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Valor Informado</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {printData.inputs.map((input, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-2">{input.label}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-bold">{input.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results Box */}
          <div className="mb-6 p-6 bg-gray-50 border-2 border-green-800 rounded-lg">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">2. Resultados Obtidos</h4>
            <div className="space-y-4">
              {printData.results.map((result, idx) => (
                <div key={idx} className="flex justify-between items-baseline border-b border-gray-200 pb-2 last:border-none last:pb-0">
                  <span className="text-sm font-semibold text-gray-700">{result.label}:</span>
                  <span className="text-3xl font-black text-green-900">{result.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Equation */}
          <div className="mb-6 text-xs text-gray-600 bg-gray-50 p-4 rounded border border-gray-200">
            <span className="font-bold block text-gray-700 mb-1">Equação Utilizada:</span>
            <code className="block font-mono bg-white p-2 border border-gray-200 rounded text-center text-xs font-bold text-gray-800">
              {printData.formula}
            </code>
          </div>

          {/* Guidelines */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">3. Orientações e Próximos Passos</h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-700">
              {printData.guidelines.map((guide, idx) => (
                <li key={idx} className="leading-relaxed">{guide}</li>
              ))}
              <li className="leading-relaxed text-gray-400 italic mt-6 list-none border-t border-gray-200 pt-4">
                Aviso: Este documento é uma estimativa matemática baseada em laudos ou contagens amostrais inseridas pelo próprio usuário. É fortemente recomendado consultar um Engenheiro Agrônomo para elaboração do planejamento agronômico e receituário definitivo.
              </li>
            </ul>
          </div>

          {/* Print Footer */}
          <div className="mt-20 pt-8 border-t border-gray-200 flex justify-between text-[10px] text-gray-400 font-medium">
            <div>
              <p>Relatório emitido através do Painel do Agronegócio — painelagrofocus.com</p>
            </div>
            <div>
              <p>Página 1 de 1</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Calculadoras;
