'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">1P</div>
          </Link>
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-[#6b6b80] mt-2">Start creating and publishing content</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input type="text" className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" className="input-field" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-[#6b6b80]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
