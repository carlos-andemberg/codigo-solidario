import { useState, useEffect } from 'react';
import { db, auth } from './services/firebase'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'; 
import { LogIn, LogOut, ShieldAlert, ShieldCheck, Lock, Mail, Key } from 'lucide-react'; 

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Gestao from './components/Gestao';
import Sobre from './components/Sobre';

function App() {
  const [paginaAtual, setPaginaAtual] = useState('dashboard');
  const [user, setUser] = useState(null);
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  const [doacoes, setDoacoes] = useState([]);
  const [totalArrecadado, setTotalArrecadado] = useState(0);
  const [totaisPorTipo, setTotaisPorTipo] = useState({});
  const metaCiclo = 120;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setErroLogin('');
    
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      setEmail('');
      setSenha('');
    } catch (error) {
      console.error("Erro:", error);
      setErroLogin('Credenciais inválidas. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setPaginaAtual('dashboard'); 
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 flex flex-col">
      <Navbar paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} />
      
      {/* Barra de Status */}
      {user && (
        <div className="bg-black text-white px-4 py-2 text-xs flex justify-between items-center transition-colors">
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-green-400" />
            Monitor Logado: {user.email}
          </span>
          <button onClick={handleLogout} className="flex items-center gap-1 hover:text-gray-300 bg-white/10 px-2 py-1 rounded transition-colors">
            Sair <LogOut size={12} />
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {paginaAtual === 'dashboard' && <Dashboard doacoes={doacoes} totalArrecadado={totalArrecadado} metaCiclo={metaCiclo} />}
        {paginaAtual === 'sobre' && <Sobre />}

        {paginaAtual === 'gestao' && (
          user ? (
            <Gestao doacoes={doacoes} totaisPorTipo={totaisPorTipo} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 animate-[fadeIn_0.5s]">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock size={32} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Acesso Restrito</h2>
                <p className="text-gray-500 mb-6 text-sm text-center">Área exclusiva para monitores.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">E-mail Institucional</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail size={16} />
                      </div>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="usuario@ifal.edu.br"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Senha</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Key size={16} />
                      </div>
                      <input 
                        type="password" 
                        required
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {erroLogin && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                      <ShieldAlert size={14} /> {erroLogin}
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <LogIn size={18} /> Acessar Sistema
                  </button>
                </form>
              </div>
            </div>
          )
        )}

      </main>
    </div>
  );
}

export default App;