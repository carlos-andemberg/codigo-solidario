import { useState, useEffect } from 'react';
import { db } from './services/firebase'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// Componentes
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Gestao from './components/Gestao';
import Sobre from './components/Sobre';

function App() {
  const [paginaAtual, setPaginaAtual] = useState('dashboard');
  const [doacoes, setDoacoes] = useState([]);
  const [totalArrecadado, setTotalArrecadado] = useState(0);
  const [totaisPorTipo, setTotaisPorTipo] = useState({});

  const metaCiclo = 120;

  useEffect(() => {
    const q = query(collection(db, "doacoes"), orderBy("data_registro", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoacoes(lista);
      setTotalArrecadado(lista.reduce((acc, doc) => acc + Number(doc.total_kg || 0), 0));
      
      const agrupamento = {};
      lista.forEach(doc => {
        doc.itens?.forEach(item => {
          const nome = item.tipo === 'Outros' ? item.descricao_custom : item.tipo;
          agrupamento[nome] = (agrupamento[nome] || 0) + Number(item.peso);
        });
      });
      setTotaisPorTipo(agrupamento);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 flex flex-col">
      <Navbar paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {paginaAtual === 'dashboard' && <Dashboard doacoes={doacoes} totalArrecadado={totalArrecadado} metaCiclo={metaCiclo} />}
        {paginaAtual === 'gestao' && <Gestao doacoes={doacoes} totaisPorTipo={totaisPorTipo} />}
        {paginaAtual === 'sobre' && <Sobre />}
      </main>
    </div>
  );
}

export default App;