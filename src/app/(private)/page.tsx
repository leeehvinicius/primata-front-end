export default function PrivatePage() {
  return (
    <div className="card p-8 text-center animate-fade-in">
      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
        <span className="text-white font-bold text-2xl">🏠</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo ao Sistema</h1>
      <p className="text-gray-600 text-lg mb-6">Selecione uma opção no menu lateral para começar a usar o sistema.</p>
      
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition-all duration-300">
          <h3 className="font-semibold text-green-800 mb-2">📊 Dashboard</h3>
          <p className="text-sm text-green-700">Visualize métricas e relatórios da clínica</p>
        </div>
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:shadow-md transition-all duration-300">
          <h3 className="font-semibold text-blue-800 mb-2">👥 Usuários</h3>
          <p className="text-sm text-blue-700">Gerencie usuários e permissões do sistema</p>
        </div>
      </div>
    </div>
  )
}