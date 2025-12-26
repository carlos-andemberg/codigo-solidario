import { useState } from 'react';
import { Plus, LayoutList, Trash2, X } from 'lucide-react';
import { addDoc, collection, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Gestao({ doacoes, totaisPorTipo }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  
  // Estados do Formulário
  const [novoAluno, setNovoAluno] = useState('');
  const [listaItens, setListaItens] = useState([]);
  const [itemTempTipo, setItemTempTipo] = useState('');
  const [itemTempOutro, setItemTempOutro] = useState('');
  const [itemTempPeso, setItemTempPeso] = useState('');

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
    if (!novoAluno || listaItens.length === 0) return;
    setCarregando(true);
    try {
      const pesoTotalDoacao = listaItens.reduce((acc, item) => acc + item.peso, 0);
      await addDoc(collection(db, "doacoes"), {
        aluno_nome: novoAluno, itens: listaItens, total_kg: pesoTotalDoacao,
        data_registro: serverTimestamp(), data_visual: new Date().toLocaleDateString('pt-BR'), status: 'Aprovado'
      });
      setNovoAluno(''); setListaItens([]); setModalAberto(false);
    } catch (error) { alert("Erro ao salvar."); } finally { setCarregando(false); }
  };

  const deletarDoacao = async (id) => {
    if(window.confirm("Excluir registro?")) await deleteDoc(doc(db, "doacoes", id));
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s]">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestão de Estoque</h2>
        <button onClick={() => setModalAberto(true)} className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
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
            <tr><th className="px-6 py-3">Aluno</th><th className="px-6 py-3">Itens</th><th className="px-6 py-3">Total</th><th className="px-6 py-3 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {doacoes.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{doc.aluno_nome}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {doc.itens?.map((i, idx) => <span key={idx} className="mr-2">{i.nome_exibicao} ({i.peso}kg)</span>)}
                </td>
                <td className="px-6 py-4 font-bold text-green-700">{doc.total_kg.toFixed(2)} kg</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deletarDoacao(doc.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 my-8">
            <div className="flex justify-between mb-6 border-b pb-4">
              <h3 className="text-xl font-bold">Nova Entrada</h3>
              <button onClick={() => setModalAberto(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSalvarDoacao} className="space-y-4">
              <input type="text" value={novoAluno} onChange={(e) => setNovoAluno(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Nome do Aluno" />
              
              <div className="bg-gray-50 p-4 rounded-lg flex gap-2 flex-wrap">
                <select value={itemTempTipo} onChange={(e) => setItemTempTipo(e.target.value)} className="flex-1 p-2 border rounded text-sm">
                  <option value="">Item...</option><option value="Arroz">Arroz</option><option value="Feijão">Feijão</option><option value="Macarrão">Macarrão</option><option value="Açúcar">Açúcar</option><option value="Leite">Leite</option><option value="Outros">Outros</option>
                </select>
                {itemTempTipo === 'Outros' && (
                   <input type="text" value={itemTempOutro} onChange={(e) => setItemTempOutro(e.target.value)} className="w-full sm:w-auto p-2 border rounded text-sm" placeholder="Nome..." />
                )}
                <input type="number" value={itemTempPeso} onChange={(e) => setItemTempPeso(e.target.value)} className="w-20 p-2 border rounded text-sm" placeholder="Kg" step="0.1" />
                <button type="button" onClick={adicionarItemNaLista} className="bg-blue-600 text-white px-3 rounded font-bold">+</button>
              </div>
              
              <div className="text-sm border rounded p-2 max-h-32 overflow-y-auto">
                {listaItens.length === 0 ? <p className="text-gray-400 text-center">Nenhum item adicionado</p> : listaItens.map(i => (
                  <div key={i.id} className="flex justify-between border-b last:border-0 p-2">
                    <span>{i.nome_exibicao}</span>
                    <div className="flex gap-2"><b>{i.peso}kg</b> <button type="button" onClick={() => removerItemDaLista(i.id)} className="text-red-500">x</button></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2">
                 <span className="font-bold text-gray-700">Total: {listaItens.reduce((acc, i) => acc + i.peso, 0).toFixed(2)} kg</span>
                 <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}