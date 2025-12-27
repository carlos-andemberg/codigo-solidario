import { useState, useEffect } from 'react';
import { db, auth } from './services/firebase'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'firebase/auth'; 
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
  const [mostrarConfirmacaoLogout, setMostrarConfirmacaoLogout] = useState(false);

  const [doacoes, setDoacoes] = useState([]);
  const [totalArrecadado, setTotalArrecadado] = useState(0);
  const [totaisPorTipo, setTotaisPorTipo] = useState({});
  const metaCiclo = 120;

  // --- TRAVA 1: TIMER DE INATIVIDADE (5 HORAS) ---
  // Ideal para um turno escolar. Protege se o monitor deixar a tela aberta.
  useEffect(() => {
    let timerSeguranca;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // 5 horas = 5 * 60 * 60 * 1000 = 18.000.000 ms
        timerSeguranca = setTimeout(() => {
          signOut(auth);
          alert("Sessão expirada por segurança (5h). Por favor, faça login novamente.");
          setPaginaAtual('dashboard');
        }, 18000000); 
      }
    });

    return () => {
      unsubscribeAuth();
      if (timerSeguranca) clearTimeout(timerSeguranca);
    };
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

  // --- TRAVA 2: PERSISTÊNCIA DE SESSÃO ---
  // Garante que: Fechou o navegador = Deslogou.
  const handleLogin = async (e) => {
    e.preventDefault();
    setErroLogin('');
    
    try {
      // Configura para memória volátil (sessão) antes de logar
      await setPersistence(auth, browserSessionPersistence);
      
      await signInWithEmailAndPassword(auth, email, senha);
      
      setEmail('');
      setSenha('');
    } catch (error) {
      console.error("Erro:", error);
      setErroLogin('E-mail ou senha incorretos.');
    }
  };

  const solicitarLogout = () => setMostrarConfirmacaoLogout(true);

  const confirmarLogout = async () => {
    await signOut(auth);
    setMostrarConfirmacaoLogout(false);
    setPaginaAtual('dashboard'); 
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 flex flex-col">
      <Navbar paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} />
      
      {user && (
        <div className="bg-black text-white px-4 py-2 text-xs flex justify-between items-center transition-colors">
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-green-400" />
            Admin Logado: {user.email}
          </span>
          <button onClick={solicitarLogout} className="flex items-center gap-1 hover:text-gray-300 bg-white/10 px-2 py-1 rounded transition-colors">
            Sair <LogOut size={12} />
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {paginaAtual === 'dashboard' && (
          <Dashboard 
            doacoes={doacoes} 
            totalArrecadado={totalArrecadado} 
            metaCiclo={metaCiclo} 
            totaisPorTipo={totaisPorTipo}
          />
        )}
        
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
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={16} /></div>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" placeholder="usuario@ifal.edu.br" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Senha</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Key size={16} /></div>
                      <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" placeholder="••••••••" />
                    </div>
                  </div>
                  {erroLogin && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2"><ShieldAlert size={14} /> {erroLogin}</div>}
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"><LogIn size={18} /> Acessar Sistema</button>
                </form>
              </div>
            </div>
          )
        )}
      </main>

      {/* MODAL LOGOUT */}
      {mostrarConfirmacaoLogout && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-[scaleIn_0.2s]">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Sair do Sistema?</h3>
              <p className="text-sm text-gray-500 mb-6">Você precisará fazer login novamente para acessar a área de gestão.</p>
              <div className="flex gap-3">
                <button onClick={() => setMostrarConfirmacaoLogout(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={confirmarLogout} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-md">Sair Agora</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;