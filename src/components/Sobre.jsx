import { Info, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Sobre() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-[fadeIn_0.5s]">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Info size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Sobre o Projeto</h2>
          <p className="text-gray-500 font-medium">Código Solidário: Programando Futuros e Combatendo a Fome</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><ShieldCheck className="text-blue-500" /> Metodologia</h3>
          <p className="text-sm text-gray-600 leading-relaxed">O projeto une ensino tecnológico com responsabilidade social. A permanência é condicionada à doação de alimentos.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><HeartHandshake className="text-orange-500" /> Destinação</h3>
          <p className="text-sm text-gray-600 leading-relaxed">Todo o material é entregue a parceiros como o <strong>Lions Club</strong> e instituições locais.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6 border-b pb-4">Regras (Ciclo Trimestral)</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} /> <span className="text-sm text-gray-600"><strong>Inscrição:</strong> Doação de 2kg de alimentos.</span></li>
          <li className="flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} /> <span className="text-sm text-gray-600"><strong>Renovação Mensal:</strong> Mais 2kg por mês.</span></li>
        </ul>
      </div>
    </div>
  );
}