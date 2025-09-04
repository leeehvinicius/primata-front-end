export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6">
            <span className="text-white font-bold text-4xl">P</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Primata Estética
          </h1>
          <p className="text-xl text-gray-600 mb-8">Sistema de Gestão Clínica & Estética</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">🎯 Gestão Completa</h2>
            <p className="text-gray-600">Controle total sobre usuários, serviços, agendamentos e finanças da clínica.</p>
          </div>
          <div className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">📊 Dashboard Inteligente</h2>
            <p className="text-gray-600">Visualize métricas importantes e acompanhe o desempenho da clínica em tempo real.</p>
          </div>
        </div>
        
        <div className="card p-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 Comece Agora</h2>
          <p className="text-green-100 mb-6">Acesse o sistema para gerenciar sua clínica de forma profissional e eficiente.</p>
          <button className="btn bg-white text-green-600 hover:bg-green-50 px-8 py-3 text-lg font-semibold">
            Acessar Sistema
          </button>
        </div>
      </div>
    </div>
  )
}