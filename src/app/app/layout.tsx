import Link from 'next/link';
import { Dumbbell, Activity, User, LogOut } from 'lucide-react';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';

export default async function StudentAppLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    let tenant = null;

    if (token) {
        const session = await decrypt(token);
        if (session && session.tenantId) {
            tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            {/* Mobile Header */}
            <header className="bg-neutral-900 border-b border-neutral-800 p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                    {tenant?.name || 'TrainerOS'}
                </h1>
                <form action="/api/auth/logout" method="POST">
                    <button type="submit" className="text-neutral-400 hover:text-white transition-colors bg-neutral-800 p-2 rounded-full">
                        <LogOut size={16} />
                    </button>
                </form>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24">
                <div className="p-4 md:max-w-md md:mx-auto">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="bg-neutral-900 border-t border-neutral-800 fixed bottom-0 w-full md:hidden flex justify-around p-3 pb-5 z-10">
                <Link href="/app" className="flex flex-col items-center text-emerald-500">
                    <Dumbbell size={24} />
                    <span className="text-[10px] mt-1 font-medium">Treinos</span>
                </Link>
                <Link href="/app/progress" className="flex flex-col items-center text-neutral-500 hover:text-emerald-500 transition-colors">
                    <Activity size={24} />
                    <span className="text-[10px] mt-1 font-medium">Evolução</span>
                </Link>
                <Link href="/app/profile" className="flex flex-col items-center text-neutral-500 hover:text-emerald-500 transition-colors">
                    <User size={24} />
                    <span className="text-[10px] mt-1 font-medium">Perfil</span>
                </Link>
            </nav>
        </div>
    );
}
