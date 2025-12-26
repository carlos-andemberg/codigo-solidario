import { useState, useMemo } from 'react';
import { Plus, LayoutList, Trash2, X, User, FileText, Search } from 'lucide-react';
import { addDoc, collection, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Gestao({ doacoes, totaisPorTipo }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  
  // Estados do Formulário
  const [novoAluno, setNovoAluno] = useState('');
  const [novoCpf, setNovoCpf] = useState('');
  const [listaItens, setListaItens] = useState([]);
  
  // Estados temporários
  const [itemTempTipo, setItemTempTipo] = useState('');
  const [itemTempOutro, setItemTempOutro] = useState('');
  const [itemTempPeso, setItemTempPeso] = useState('');

  // --- LÓGICA INTELIGENTE: Extrair lista de alunos únicos do histórico ---
  const alunosCadastrados = useMemo(() => {
    const unicos = new Map();
    doacoes.forEach(doc => {
      // Só considera se tiver CPF e Nome
      if (doc.aluno_cpf && doc.aluno_nome) {
        if (!unicos.has(doc.aluno_cpf)) {
          unicos.set(doc.aluno_cpf, doc.aluno_nome);
        }
      }
    });
    // Transforma em array e ordena alfabeticamente
    return Array.from(unicos.entries())
      .map(([cpf, nome]) => ({ cpf, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [doacoes]);

  const preencherAlunoExistente = (e) => {
    const cpfSelecionado = e.target.value;
    if (!cpfSelecionado) return;

    const aluno = alunosCadastrados.find(a => a.cpf === cpfSelecionado);
    if (aluno) {
      setNovoAluno(aluno.nome);
      setNovoCpf(aluno.cpf);
    }
  };
  // ---------------------------------------------------------------------

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setNovoCpf(value);
  };

  const adicionarItemNaLista = () => {
    if (!itemTempTipo || !itemTempPeso) return;
    const nomeFinal = itemTempTipo === 'Outros' ? itemTempOutro : itemTempTipo;
    const novoItem = { id: Date.now(), tipo: itemTempTipo, descricao_custom: itemTempOutro, nome_exibicao: nomeFinal, peso: parseFloat(itemTempPeso) };
    setListaItens([...listaItens, novoItem]);
    setItemTempTipo(''); setItemTempOutro(''); setItemTempPeso('');
  };

  const removerItemDaLista = (id) => setListaItens(listaItens.filter(item => item.id !== id));

  const handleSalvarDoacao = async (e) => {
    e.preventDefault();
    if (!novoAluno || !novoCpf || listaItens.length === 0) {
      alert("Preencha Nome, CPF e adicione pelo menos um item.");
      return;
    }
    
    setCarregando(true);
    try {
      const pesoTotalDoacao = listaItens.reduce((acc, item) => acc + item.peso, 0);
      
      await addDoc(collection(db, "doacoes"), {
        aluno_nome: novoAluno,
        aluno_cpf: novoCpf,
        itens: listaItens, 
        total_kg: pesoTotalDoacao,
        data_registro: serverTimestamp(), 
        data_visual: new Date().toLocaleDateString('pt-BR'), 
        status: 'Aprovado'
      });

      setNovoAluno(''); 
      setNovoCpf(''); 
      setListaItens([]); 
      setModalAberto(false);
    } catch (error) { 
      console.error(error);
      alert("Erro ao salvar."); 
    } finally { 
      setCarregando(false); 
    }
  };

  const deletarDoacao = async (id) => {
    if(window.confirm("Excluir registro?")) await deleteDoc(doc(db, "doacoes", id));
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s]">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestão de Estoque</h2>
        <button onClick={() => setModalAberto(true)} className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95">
          <Plus size={18} /> Nova Entrada
        </button>
      </div>

      {/* Estoque Resumido */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-blue-800"><LayoutList size={20} /><h3 className="font-bold">Inventário Físico</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(totaisPorTipo).length > 0 ? Object.entries(totaisPorTipo).map(([tipo, peso]) => (
            <div key={tipo} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">{tipo}</span>
              <span className="text-2xl font-bold text-gray-800">{peso.toFixed(1)} kg</span>
            </div>
          )) : <p className="text-gray-400 col-span-4 text-sm">Nenhum item em estoque.</p>}
        </div>
      </div>

      {/* Tabela de Gestão */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">Aluno / CPF</th>
              <th className="px-6 py-3">Itens</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {doacoes.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{doc.aluno_nome}</div>
                  <div className="text-xs text-gray-400">{doc.aluno_cpf || 'S/ CPF'}</div>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {doc.itens?.map((i, idx) => <span key={idx} className="mr-2 border border-gray-200 px-1 rounded bg-gray-50">{i.nome_exibicao} ({i.peso}kg)</span>)}
                </td>
                <td className="px-6 py-4 font-bold text-green-700">{doc.total_kg ? doc.total_kg.toFixed(2) : 0} kg</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deletarDoacao(doc.id)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 my-8 animate-[scaleIn_0.2s]">
            <div className="flex justify-between mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">Nova Entrada</h3>
              <button onClick={() => setModalAberto(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            
            <form onSubmit={handleSalvarDoacao} className="space-y-4">
              
              {/* --- NOVO: SELETOR DE ALUNOS JÁ CADASTRADOS --- */}
              {alunosCadastrados.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                  <label className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                    <Search size={12} /> Auto-preencher Aluno Existente
                  </label>
                  <select 
                    onChange={preencherAlunoExistente} 
                    className="w-full p-2 border border-blue-200 rounded text-sm bg-white focus:outline-none focus:border-blue-500 text-gray-700"
                    defaultValue=""
                  >
                    <option value="" disabled>Selecione um aluno da lista...</option>
                    {alunosCadastrados.map((aluno) => (
                      <option key={aluno.cpf} value={aluno.cpf}>
                        {aluno.nome} ({aluno.cpf})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Campos do Aluno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Nome do Aluno</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" 
                      required
                      value={novoAluno} 
                      onChange={(e) => setNovoAluno(e.target.value)} 
                      className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                      placeholder="Ex: Carlos Silva" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">CPF (Identificador)</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" 
                      required
                      value={novoCpf} 
                      onChange={handleCpfChange} 
                      className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                      placeholder="000.000.000-00" 
                    />
                  </div>
                </div>
              </div>

              {/* Área de Itens */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Adicionar Alimentos</label>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <select value={itemTempTipo} onChange={(e) => setItemTempTipo(e.target.value)} className="flex-1 p-2 border rounded text-sm">
                    <option value="">Selecione...</option><option value="Arroz">Arroz</option><option value="Feijão">Feijão</option><option value="Macarrão">Macarrão</option><option value="Açúcar">Açúcar</option><option value="Leite">Leite</option><option value="Outros">Outros</option>
                  </select>
                  {itemTempTipo === 'Outros' && (
                     <input type="text" value={itemTempOutro} onChange={(e) => setItemTempOutro(e.target.value)} className="w-full sm:w-auto p-2 border rounded text-sm" placeholder="Nome do item..." />
                  )}
                  <input type="number" value={itemTempPeso} onChange={(e) => setItemTempPeso(e.target.value)} className="w-20 p-2 border rounded text-sm" placeholder="Kg" step="0.1" />
                  <button type="button" onClick={adicionarItemNaLista} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded font-bold transition-colors">+</button>
                </div>
              </div>
              
              {/* Lista Visual de Itens */}
              <div className="border rounded-lg p-0 overflow-hidden max-h-32 overflow-y-auto bg-gray-50">
                {listaItens.length === 0 ? (
                  <p className="text-gray-400 text-center py-4 text-sm">Nenhum item adicionado à cesta.</p>
                ) : (
                  listaItens.map(i => (
                    <div key={i.id} className="flex justify-between items-center border-b last:border-0 p-2 bg-white px-3">
                      <span className="text-sm text-gray-700">{i.nome_exibicao}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">{i.peso} kg</span>
                        <button type="button" onClick={() => removerItemDaLista(i.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Rodapé do Modal */}
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                 <div>
                    <span className="block text-xs text-gray-500 uppercase">Peso Total</span>
                    <span className="font-bold text-xl text-green-700">{listaItens.reduce((acc, i) => acc + i.peso, 0).toFixed(2)} kg</span>
                 </div>
                 <button 
                  type="submit" 
                  disabled={carregando}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
                 >
                   {carregando ? 'Salvando...' : 'Confirmar Doação'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}