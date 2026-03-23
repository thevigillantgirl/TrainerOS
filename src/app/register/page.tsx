'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        tenantName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/dashboard');
            } else {
                setError(data.error || 'Falha no cadastro');
            }
        } catch (err) {
            setError('Erro ao conectar ao servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Crie seu Sistema de Personal
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-400">
                    Já tem conta?{' '}
                    <Link href="/login" className="font-medium text-emerald-500 hover:text-emerald-400">
                        Faça login aqui
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-neutral-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-neutral-800">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="tenantName" className="block text-sm font-medium text-neutral-300">
                                Nome da sua Consultoria / Marca
                            </label>
                            <div className="mt-1">
                                <input
                                    id="tenantName"
                                    name="tenantName"
                                    type="text"
                                    required
                                    value={formData.tenantName}
                                    onChange={handleChange}
                                    placeholder="Ex: Treinador Pro"
                                    className="appearance-none block w-full px-3 py-2 border border-neutral-700 bg-neutral-800 rounded-md shadow-sm placeholder-neutral-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-neutral-300">
                                Seu Nome Completo
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-neutral-700 bg-neutral-800 rounded-md shadow-sm placeholder-neutral-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                                Email Profissional
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-neutral-700 bg-neutral-800 rounded-md shadow-sm placeholder-neutral-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                                Senha
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-neutral-700 bg-neutral-800 rounded-md shadow-sm placeholder-neutral-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-neutral-900 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Criando conta...' : 'Criar minha Consultoria'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
