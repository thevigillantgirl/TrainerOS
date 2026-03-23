import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">TrainerOS</span>
        </h1>
        <p className="text-xl md:text-2xl text-neutral-400 font-light">
          A plataforma definitiva para Personal Trainers escalarem suas consultorias.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link href="/register" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            Criar Minha Consultoria
          </Link>
          <Link href="/login" className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg text-lg border border-neutral-700 transition-all">
            Fazer Login
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Multi-Tenant</h3>
            <p className="text-neutral-400">Ambiente isolado para sua marca, com seus alunos, treinos e identidade visual.</p>
          </div>
          <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">App do Aluno</h3>
            <p className="text-neutral-400">Seus alunos acessam treinos, registram evolução e visualizam fotos direto pelo app.</p>
          </div>
          <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Receita Recorrente</h3>
            <p className="text-neutral-400">Estrutura SaaS preparada para você escalar sua consultoria como uma verdadeira empresa.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
