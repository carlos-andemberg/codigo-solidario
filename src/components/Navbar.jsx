import { Package, BarChart3, Settings, Info } from 'lucide-react';

export default function Navbar({ paginaAtual, setPaginaAtual }) {
  const btnClass = (pag) => `px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 
    ${paginaAtual === pag ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4">
      <div className="max-w-7xl mx-auto h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 text-white p-2 rounded-lg"><Package size={20} /></div>
          <span className="font-bold text-gray-900 text-lg hidden sm:block">Código Solidário</span>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setPaginaAtual('dashboard')} className={btnClass('dashboard')}>
            <BarChart3 size={16} /> <span className="hidden sm:inline">Visão Geral</span>
          </button>
          <button onClick={() => setPaginaAtual('gestao')} className={btnClass('gestao')}>
            <Settings size={16} /> <span className="hidden sm:inline">Gestão</span>
          </button>
          <button onClick={() => setPaginaAtual('sobre')} className={btnClass('sobre')}>
            <Info size={16} /> <span className="hidden sm:inline">Sobre</span>
          </button>
        </div>
      </div>
    </nav>
  );
}