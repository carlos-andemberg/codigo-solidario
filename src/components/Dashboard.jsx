import { useState } from 'react';
import { TrendingUp, Users, Calendar, AlertCircle, Package, X, PieChart, CheckCircle2, Clock } from 'lucide-react';

export default function Dashboard({ doacoes, totalArrecadado, metaCiclo, totaisPorTipo }) {
  const [doacaoSelecionada, setDoacaoSelecionada] = useState(null);
  const [mostrarModalTotais, setMostrarModalTotais] = useState(false);
  const [mostrarModalAlunos, setMostrarModalAlunos] = useState(false);
  const [mostrarModalCiclo, setMostrarModalCiclo] = useState(false); // Novo estado para modal de ciclo

  const porcentagem = Math.min((totalArrecadado / metaCiclo) * 100, 100);
  
  // --- LÓGICA DE ALUNOS ATIVOS ---
  const listaAlunosAtivos = (() => {
    const hoje = new Date();
    const dataAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const dadosAlunos = {};

    doacoes.forEach(doc => {
      if (!doc.data_visual || !doc.total_kg) return;
      const chave = doc.aluno_cpf || doc.aluno_nome;
      
      if (!dadosAlunos[chave]) {
        dadosAlunos[chave] = { nome: doc.aluno_nome, historico: [] };
      }
      
      const [dia, mes, ano] = doc.data_visual.split('/');
      const dataDoc = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      dadosAlunos[chave].historico.push({ data: dataDoc, peso: Number(doc.total_kg) });
    });

    const nomesAtivos = [];

    Object.values(dadosAlunos).forEach(aluno => {
      aluno.historico.sort((a, b) => a.data - b.data);
      let validadeAtual = null;
      let saldoPeso = 0;
      
      aluno.historico.forEach(doacao => {
        saldoPeso += doacao.peso;
        if (saldoPeso >= 2) {
          const mesesGanhos = Math.floor(saldoPeso / 2);
          saldoPeso = saldoPeso % 2;
          let dataInicioCredito = doacao.data;
          if (validadeAtual && validadeAtual > doacao.data) {
            dataInicioCredito = new Date(validadeAtual);
          }
          if (!validadeAtual) validadeAtual = new Date(dataInicioCredito);
          validadeAtual.setMonth(validadeAtual.getMonth() + mesesGanhos);
        }
      });
      
      if (validadeAtual && validadeAtual >= dataAtual) {
        nomesAtivos.push(aluno.nome);
      }
    });

    return nomesAtivos.sort((a, b) => a.localeCompare(b));
  })();

  const alunosAtivosMes = listaAlunosAtivos.length;

  const getInfoCiclo = () => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    // Definição das datas limites
    const datas = [
      { nome: "Ciclo 1 (Verão)", data: new Date(anoAtual, 2, 28), str: `28/03/${anoAtual}` },
      { nome: "Ciclo 2 (Outono)", data: new Date(anoAtual, 5, 27), str: `27/06/${anoAtual}` },
      { nome: "Ciclo 3 (Inverno)", data: new Date(anoAtual, 8, 26), str: `26/09/${anoAtual}` },
      { nome: "Ciclo 4 (Primavera)", data: new Date(anoAtual, 11, 12), str: `12/12/${anoAtual}` }
    ];

    // Encontra o próximo ciclo
    const proximo = datas.find(c => hoje <= c.data);
    
    // Se hoje for depois de todos (ex: fim de dezembro), retorna o primeiro do ano que vem
    if (!proximo) {
      return { 
        ...datas[0], 
        data: new Date(anoAtual + 1, 2, 28), 
        str: `28/03/${anoAtual + 1}`,
        listaCompleta: datas 
      };
    }

    return { ...proximo, listaCompleta: datas };
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
            </p>
            <p className="text-green-100 max-w-xl text-sm leading-relaxed">
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
        <div 
          onClick={() => setMostrarModalTotais(true)}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-green-500Hv relative group overflow-hidden cursor-pointer hover:bg-green-50 transition-colors"
        >
           <div className="absolute right-0 top-0 w-16 h-16 bg-green-50 rounded-bl-full transition-transform group-hover:scale-125"></div>
          <div className="bg-green-100 p-3 rounded-full text-green-600 relative z-10"><TrendingUp size={28} /></div>
          <div className="relative z-10">
            <p className="text-gray-500 text-xs font-bold uppercase flex items-center gap-1">Total Arrecadado <PieChart size={12} /></p>
            <h3 className="text-3xl font-bold text-gray-800">{totalArrecadado.toFixed(1)} <span className="text-lg text-gray-400 font-normal">kg</span></h3>
            <p className="text-[10px] text-green-600 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Ver detalhes por item</p>
          </div>
        </div>

        {/* Card 2: Alunos Ativos */}
        <div 
          onClick={() => setMostrarModalAlunos(true)}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-blue-500 relative group overflow-hidden cursor-pointer hover:bg-blue-50 transition-colors"
        >
          <div className="absolute right-0 top-0 w-16 h-16 bg-blue-50 rounded-bl-full transition-transform group-hover:scale-125"></div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 relative z-10"><Users size={28} /></div>
          <div className="relative z-10">
            <p className="text-gray-500 text-xs font-bold uppercase flex items-center gap-1">Alunos Ativos <CheckCircle2 size={12} /></p>
            <h3 className="text-3xl font-bold text-gray-800">
              {alunosAtivosMes} <span className="text-lg text-gray-400 font-normal">/ 20</span>
            </h3>
            <p className="text-[10px] text-blue-600 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Ver lista de nomes</p>
          </div>
        </div>

        {/* Card 3: Ciclo (AGORA CLICÁVEL) */}
        <div 
          onClick={() => setMostrarModalCiclo(true)}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-orange-500 relative group overflow-hidden cursor-pointer hover:bg-orange-50 transition-colors"
        >
           <div className="absolute right-0 top-0 w-16 h-16 bg-orange-50 rounded-bl-full transition-transform group-hover:scale-125"></div>
          <div className="bg-orange-100 p-3 rounded-full text-orange-600 relative z-10"><Calendar size={28} /></div>
          <div className="relative z-10">
            <p className="text-gray-500 text-xs font-bold uppercase">Encerramento do Ciclo</p>
            <h3 className="text-2xl font-bold text-gray-800">{infoCiclo.str}</h3>
            <div className="flex items-center gap-1 mt-1">
               <AlertCircle size={12} className="text-orange-600" />
               <p className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Próxima doação via Lions Club</p>
            </div>
            <p className="text-[10px] text-orange-600 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Ver cronograma completo</p>
          </div>
        </div>
      </div>

      {/* Lista Recente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">Últimas Contribuições</h3>
          <span className="text-xs text-gray-400 border bg-white px-2 py-1 rounded shadow-sm">Clique para detalhes</span>
        </div>
        <div className="divide-y divide-gray-100">
          {doacoes.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
               <AlertCircle size={32} className="mb-2 text-gray-200" />
               <p className="text-sm">O banco de dados do ciclo atual está vazio.</p>
            </div>
          ) : (
            doacoes.slice(0, 5).map(doc => (
              <div 
                key={doc.id} 
                onClick={() => setDoacaoSelecionada(doc)}
                className="p-4 flex justify-between items-center hover:bg-blue-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs border border-white shadow-sm group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                    {doc.aluno_nome ? doc.aluno_nome.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm group-hover:text-blue-700">{doc.aluno_nome}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {doc.data_visual} • 
                      <span className="text-gray-400 font-normal">
                         {doc.itens?.length || 1} item(ns)
                      </span>
                    </p>
                  </div>
                </div>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-md text-xs font-bold border border-green-100 group-hover:bg-green-100">
                  +{doc.total_kg ? doc.total_kg.toFixed(2) : 0} kg
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL 1: DETALHES DA DOAÇÃO --- */}
      {doacaoSelecionada && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-[scaleIn_0.2s]">
            <button onClick={() => setDoacaoSelecionada(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3"><Package size={32} /></div>
              <h3 className="text-lg font-bold text-gray-800">Detalhes da Contribuição</h3>
              <p className="text-sm text-gray-500">Registrado em {doacaoSelecionada.data_visual}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Doador:</span>
                <span className="font-bold text-gray-800 text-lg">{doacaoSelecionada.aluno_nome}</span>
              </div>
            </div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 pl-1">Itens Doados</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-6 pr-1">
              {doacaoSelecionada.itens?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-700 font-medium">{item.nome_exibicao}</span>
                  <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">{item.peso} kg</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">Total desta doação</span>
              <span className="text-2xl font-bold text-green-700">{doacaoSelecionada.total_kg.toFixed(2)} kg</span>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: TOTAIS POR TIPO --- */}
      {mostrarModalTotais && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-[scaleIn_0.2s]">
            <button onClick={() => setMostrarModalTotais(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3"><PieChart size={32} /></div>
              <h3 className="text-lg font-bold text-gray-800">Balanço por Alimento</h3>
              <p className="text-sm text-gray-500">Detalhamento do total arrecadado</p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {totaisPorTipo && Object.keys(totaisPorTipo).length > 0 ? (
                Object.entries(totaisPorTipo)
                  .sort(([,a], [,b]) => b - a)
                  .map(([tipo, peso]) => (
                  <div key={tipo} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-sm font-bold text-gray-700">{tipo}</span>
                    <span className="text-sm font-bold text-green-700">{peso.toFixed(2)} kg</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4">Nenhum dado disponível.</p>
              )}
            </div>

            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Geral</span>
              <span className="text-2xl font-bold text-green-700">{totalArrecadado.toFixed(2)} kg</span>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: LISTA DE ALUNOS ATIVOS --- */}
      {mostrarModalAlunos && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-[scaleIn_0.2s]">
            <button onClick={() => setMostrarModalAlunos(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3"><Users size={32} /></div>
              <h3 className="text-lg font-bold text-gray-800">Alunos Ativos</h3>
              <p className="text-sm text-gray-500">Alunos regulares com doações em dia</p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {listaAlunosAtivos.length > 0 ? (
                listaAlunosAtivos.map((nome, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-100 shadow-sm">
                        {index + 1}
                     </div>
                    <span className="text-sm font-bold text-gray-700">{nome}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">Nenhum aluno ativo no momento.</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Ativos</span>
              <span className="text-2xl font-bold text-blue-600">{listaAlunosAtivos.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: CRONOGRAMA DE CICLOS (NOVO) --- */}
      {mostrarModalCiclo && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-[scaleIn_0.2s]">
            <button onClick={() => setMostrarModalCiclo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3"><Calendar size={32} /></div>
              <h3 className="text-lg font-bold text-gray-800">Cronograma de Ciclos</h3>
              <p className="text-sm text-gray-500">Prazos de entrega para o Lions Club</p>
            </div>

            <div className="space-y-3">
              {infoCiclo.listaCompleta.map((ciclo, idx) => {
                const isCurrent = ciclo.nome === infoCiclo.nome;
                return (
                  <div 
                    key={idx} 
                    className={`flex justify-between items-center p-4 rounded-lg border transition-all ${
                      isCurrent 
                        ? 'bg-orange-50 border-orange-200 shadow-sm scale-[1.02]' 
                        : 'bg-white border-gray-100 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isCurrent && <Clock size={16} className="text-orange-600 animate-pulse" />}
                      <span className={`text-sm font-bold ${isCurrent ? 'text-orange-800' : 'text-gray-600'}`}>
                        {ciclo.nome}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${isCurrent ? 'text-orange-600' : 'text-gray-400'}`}>
                      {ciclo.str}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg text-xs text-gray-500 leading-relaxed border border-gray-100 flex gap-2">
               <AlertCircle size={16} className="text-orange-400 shrink-0" />
               <p>Os alimentos arrecadados são contabilizados até a data de encerramento de cada ciclo para entrega às instituições parceiras.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}