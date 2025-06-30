import { useState } from "react";
import { FlaskConical, Calculator, FlaskRound } from "lucide-react";

export default function App() {
  const [view, setView] = useState("calcolatore");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="flex justify-around items-center p-3 bg-white border-b shadow-sm sticky top-0 z-10">
        <button onClick={() => setView("calcolatore")} className="flex flex-col items-center text-sm">
          <Calculator className="w-5 h-5" />
          Calcolatore
        </button>
        <button onClick={() => setView("protocollo")} className="flex flex-col items-center text-sm">
          <FlaskConical className="w-5 h-5" />
          Protocollo
        </button>
      </nav>

      <main className="p-4">
        {view === "calcolatore" ? <CalcolatorePMDD /> : <ProtocolloPMDD />}
      </main>
    </div>
  );
}

function ProtocolloPMDD() {
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 bg-white rounded-3xl shadow-xl border border-gray-200">
      <h1 className="text-xl font-bold">🔬 Protocollo PMDD</h1>
      <div className="space-y-2 text-sm">
        <h2 className="font-semibold flex items-center gap-2">
          <FlaskRound className="w-5 h-5" /> Preparazione
        </h2>
        <p>Ora ci servono due bottiglie da un litro per NK e magnesio; e una da mezzo litro per il ferro. Le bottiglie non devono essere trasparenti (per evitare che passi la luce, formando alghe). Alcuni le rivestono con alluminio Domopak o simili.</p>
        <p>Nella prima bottiglia da un litro metteremo 250 grammi di nitrato di potassio, fino a ¾, agiteremo vigorosamente fino allo scioglimento e finiremo di riempire la bottiglia fino al limite. Avremo ottenuto un integratore al 13%, con quasi il 10% di potassio e solo il 3% di azoto.</p>
        <p>Gli effetti di tale soluzione li vedremo meglio più avanti, nell’appendice in fondo a questo articolo. Per adesso vi segnalo che è un po’ difficile da sciogliere, ma potete usare acqua calda, oppure un frullatore. In alternativa, riducete il dosaggio a 200 g. Le percentuali si ridurranno in proporzione.</p>
        <p>Nella seconda bottiglia da un litro verseremo 10 bustine di sale inglese (300 g) procedendo allo stesso modo. Si scioglierà molto meglio perché eptaidrato (contiene già acqua per oltre metà). Alla fine avremo una soluzione con il 3% di Magnesio e il 4% di Zolfo.</p>
        <p>Come abbiamo visto, lo zolfo dovrebbe essere la metà del magnesio, quindi avremo un eccesso. Non c’è problema, capita con tutti i fertilizzanti, anche quelli commerciali. Lo zolfo è un elemento molto ben tollerato, sia dalle piante che dai pesci; se fosse solo per lui, basterebbe un cambio d’acqua ogni sei mesi per rimettersi a posto.</p>
        <p>Sciogliete ora la bustina del ferro in mezzo litro d’acqua utilizzando la terza bottiglia (quella da mezzo litro). Se avete trovato del ferro liquido, lasciate tutto come sta.</p>
      </div>
    </div>
  );
}

function CalcolatorePMDD() {
  const [volume, setVolume] = useState("");
  const [valoriAttuali, setValoriAttuali] = useState({ no3: "", po4: "", kh: "", gh: "", fe: "" });
  const [fertilizzanti, setFertilizzanti] = useState([
    { nome: "Azoto NK Plus", concentrazione: 23.98, effetto: "NO3-" },
    { nome: "Magnesio PMDD", concentrazione: 2.47, effetto: "Mg+" },
    { nome: "Ferro PMDD", concentrazione: 20, effetto: "Fe" }, // <-- aggiornato!
    { nome: "Cifo Fosforo (azoto ureico)", concentrazione: 1.81, effetto: "PO4-" }
  ]);
  const [report, setReport] = useState([]);
  const [redfieldMsg, setRedfieldMsg] = useState("");

  const calcolaFertilizzanti = () => {
    if (!volume || isNaN(volume)) return;

    const no3 = parseFloat(valoriAttuali.no3);
    const po4 = parseFloat(valoriAttuali.po4);
    const fe = parseFloat(valoriAttuali.fe || "0");

    const rapportoIdeale = 10;
    const risultati = [];
    let msg = "";

    // NO₃ / PO₄ - Redfield ratio
    if (!isNaN(no3) && !isNaN(po4) && po4 > 0) {
      const rapporto = no3 / po4;
      msg += `🔎 Rapporto Redfield NO₃/PO₄ = ${rapporto.toFixed(1)} (ideale ≈ 10)\n`;

      if (rapporto < 9.5) {
        const targetNO3 = po4 * rapportoIdeale;
        const mg = targetNO3 - no3;
        const azoto = fertilizzanti.find(f => f.effetto === "NO3-");
        const ml = ((mg * volume) / azoto.concentrazione).toFixed(2);
        msg += `💡 Aggiungi **Azoto (NO₃⁻)**: ${mg.toFixed(2)} mg/l → **${ml} ml** di ${azoto.nome}\n`;
        risultati.push({ nome: azoto.nome, dose: ml, effetto: azoto.effetto });
      } else if (rapporto > 10.5) {
        const targetPO4 = no3 / rapportoIdeale;
        const mg = targetPO4 - po4;
        const fosforo = fertilizzanti.find(f => f.effetto === "PO4-");
        const ml = ((mg * volume) / fosforo.concentrazione).toFixed(2);
        msg += `💡 Aggiungi **Fosforo (PO₄³⁻)**: ${mg.toFixed(2)} mg/l → **${ml} ml** di ${fosforo.nome}\n`;
        risultati.push({ nome: fosforo.nome, dose: ml, effetto: fosforo.effetto });
      } else {
        msg += "✅ Il rapporto NO₃/PO₄ è già equilibrato.\n";
      }
    } else {
      msg += "⚠️ Inserisci valori validi per NO₃ e PO₄.\n";
    }

    // Ferro
    if (!isNaN(fe) && fe < 0.03) {
      const targetFe = 0.05;
      const mg = targetFe - fe;
      const ferro = fertilizzanti.find(f => f.effetto === "Fe");
      const ml = ((mg * volume) / ferro.concentrazione).toFixed(2);
      msg += `💡 Aggiungi **Ferro (Fe)**: ${mg.toFixed(2)} mg/l → **${ml} ml** di ${ferro.nome}`;
      risultati.push({ nome: ferro.nome, dose: ml, effetto: ferro.effetto });
    }

    setRedfieldMsg(msg.trim());
    setReport(risultati);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 bg-white rounded-3xl shadow-xl border border-gray-200">
      <h1 className="text-2xl font-semibold text-center text-gray-800">💧 Calcolatore PMDD</h1>

      <label className="block text-sm">Volume acquario (L)</label>
      <input
        type="number"
        value={volume}
        onChange={e => setVolume(e.target.value)}
        className="w-full p-2 rounded border"
      />

      <h2 className="text-sm font-semibold">Valori attuali</h2>
      {Object.entries(valoriAttuali).map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <label className="capitalize w-16">{k.toUpperCase()}</label>
          <input
            type="number"
            value={v}
            onChange={e => setValoriAttuali({ ...valoriAttuali, [k]: e.target.value })}
            className="flex-1 p-2 rounded border"
            placeholder={k === 'kh' || k === 'gh' ? 'dKH/dGH' : 'mg/l'}
          />
        </div>
      ))}

      <button
        onClick={calcolaFertilizzanti}
        className="w-full p-3 bg-blue-600 text-white rounded font-semibold"
      >
        Calcola
      </button>

      {redfieldMsg && (
        <div className="text-sm mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded whitespace-pre-wrap">
          {redfieldMsg}
        </div>
      )}

      {report.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-sm font-bold">💊 Da dosare:</h2>
          <ul className="space-y-1 text-sm list-disc list-inside">
            {report.map((r, i) => (
              <li key={i}>
                {r.nome}: <strong>{r.dose} ml</strong> → effetto su <code>{r.effetto}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
