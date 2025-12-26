import { TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react';

export default function Dashboard({ doacoes, totalArrecadado, metaCiclo }) {
  const porcentagem = Math.min((totalArrecadado / metaCiclo) * 100, 100);
  
  // --- LÓGICA DE ALUNOS ATIVOS (REGRA DO MÊS ATUAL) ---
  const alunosAtivosMes = (() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1; // JS começa em 0
    const anoAtual = hoje.getFullYear();

    // 1. Filtra apenas doações deste mês/ano
    const doacoesDoMes = doacoes.filter(doc => {
      if (!doc.data_visual) return false;
      const [dia, mes, ano] = doc.data_visual.split('/');
      return parseInt(mes) === mesAtual && parseInt(ano) === anoAtual;
    });

    // 2. Conta CPFs únicos (ou nomes) para não duplicar se o aluno doar 2x no mês
    const unicos = new Set(doacoesDoMes.map(d => d.aluno_cpf || d.aluno_nome));
    return unicos.size;
  })();

  // --- LÓGICA DE DATA INTELIGENTE ---
  const getInfoCiclo = () => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();

    const limiteQ1 = new Date(anoAtual, 2, 28);
    const limiteQ2 = new Date(anoAtual, 5, 27);
    const limiteQ3 = new Date(anoAtual, 8, 26);
    const limiteQ4 = new Date(anoAtual, 11, 12);

    if (hoje <= limiteQ1) return { data: `28/03/${anoAtual}`, nome: "Ciclo 1 (Verão)" };
    if (hoje <= limiteQ2) return { data: `27/06/${anoAtual}`, nome: "Ciclo 2 (Outono)" };
    if (hoje <= limiteQ3) return { data: `26/09/${anoAtual}`, nome: "Ciclo 3 (Inverno)" };
    if (hoje <= limiteQ4) return { data: `12/12/${anoAtual}`, nome: "Ciclo 4 (Primavera)" };
    return { data: `28/03/${anoAtual + 1}`, nome: "Ciclo 1 (Verão)" };
  };

  const infoCiclo = getInfoCiclo();

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s]">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <TrendingUp size={150} />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-green-50 text-xs px-2 py-1 rounded-full border border-white/20 font-bold">
                {infoCiclo.nome}
              </span>
              <span className="text-green-200 text-xs">•</span>
              <span className="text-green-100 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></span>
                Status: Em Andamento
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Painel de Impacto Social</h2>
            <p className="text-green-100 max-w-xl text-sm leading-relaxed">
              Gestão transparente do projeto <strong>Código Solidário</strong>. 
              Transformando linhas de código em alimento para Rio Largo.
            </p>
          </div>
          
          <div className="text-center bg-white/10 p-4 rounded-xl backdrop-blur-sm min-w-[140px] border border-white/20">
            <p className="text-xs font-bold text-green-100 uppercase tracking-wider mb-1">Meta Trimestral</p>
            <p className="text-4xl font-bold">{porcentagem.toFixed(0)}%</p>
            <div className="w-full bg-black/20 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-white h-full transition-all duration-1000" style={{width: `${porcentagem}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-green-500 relative group overflow-hidden">
           <div className="absolute right-0 top-0 w-16 h-16 bg-green-50 rounded-bl-full transition-transform group-hover:scale-125"></div>
          <div className="bg-green-100 p-3 rounded-full text-green-600 relative z-10"><TrendingUp size={28} /></div>
          <div className="relative z-10">
            <p className="text-gray-500 text-xs font-bold uppercase">Total Arrecadado</p>
            <h3 className="text-3xl font-bold text-gray-800">{totalArrecadado.toFixed(1)} <span className="text-lg text-gray-400 font-normal">kg</span></h3>
          </div>
        </div>

        {/* Card 2: Alunos (AGORA COM LÓGICA DE MÊS ATUAL) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-blue-500">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={28} /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Alunos Ativos (Mês)</p>
            <h3 className="text-3xl font-bold text-gray-800">
              {alunosAtivosMes} <span className="text-lg text-gray-400 font-normal">/ 20</span>
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">Renovação Mensal Obrigatória</p>
          </div>
        </div>

        {/* Card 3: Data Fixa (LIONS) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-orange-500">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Calendar size={28} /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Encerramento do Ciclo</p>
            <h3 className="text-2xl font-bold text-gray-800">{infoCiclo.data}</h3>
            <div className="flex items-center gap-1 mt-1">
               <AlertCircle size={12} className="text-orange-600" />
               <p className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Lions Club</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista Recente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">Últimas Contribuições (Auditadas)</h3>
          <span className="text-xs text-gray-400 border bg-white px-2 py-1 rounded shadow-sm">Visualização Pública</span>
        </div>
        <div className="divide-y divide-gray-100">
          {doacoes.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
               <AlertCircle size={32} className="mb-2 text-gray-200" />
               <p className="text-sm">O banco de dados do ciclo atual está vazio.</p>
            </div>
          ) : (
            doacoes.slice(0, 5).map(doc => (
              <div key={doc.id} className="p-4 flex justify-between items-center hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs border border-white shadow-sm">
                    {doc.aluno_nome ? doc.aluno_nome.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{doc.aluno_nome}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {doc.data_visual} • 
                      <span className="text-gray-400 font-normal">
                         {doc.itens?.length || 1} item(ns)
                      </span>
                    </p>
                  </div>
                </div>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-md text-xs font-bold border border-green-100">
                  +{doc.total_kg ? doc.total_kg.toFixed(2) : 0} kg
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}