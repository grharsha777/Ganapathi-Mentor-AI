import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import CliTokenDisplay from './CliTokenDisplay';

export const metadata = {
  title: 'CLI Authentication | Ganapathi Mentor AI',
};

export default async function CliAuthPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login?callbackUrl=/auth/cli');
  }

  try {
    const user = await verifyToken(token);
    if (!user) {
      redirect('/auth/login?callbackUrl=/auth/cli');
    }
  } catch {
    redirect('/auth/login?callbackUrl=/auth/cli');
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 15V9a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">CLI Authentication</h1>
          <p className="text-zinc-400">Copy this token and paste it into your terminal to authenticate the Ganapathi Hive Mind CLI.</p>
        </div>

        <CliTokenDisplay token={token} />
      </div>
    </div>
  );
}
