'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { getClient, getGqlClient } from '@/lib/graphql-client';
import { LOGIN, REGISTER } from '@/graphql/mutations';
import { ME } from '@/graphql/queries';
import { useAuthStore } from '@/store/auth.store';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const router = useRouter();
  const { setTokens } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const mutation = mode === 'login' ? LOGIN : REGISTER;
      const res: any = await getClient().request(mutation, { input });
      const tokens = res.login ?? res.register;

      // Fetch user info using the new token directly (not yet in localStorage)
      const authClient = getGqlClient(tokens.accessToken);
      const me: any = await authClient.request(ME);
      setTokens(tokens.accessToken, tokens.refreshToken, me.me);
      return tokens;
    },
    onSuccess: () => {
      toast.success(mode === 'login' ? 'Přihlášení úspěšné' : 'Účet byl vytvořen');
      router.push('/');
    },
    onError: (e: any) => toast.error(e?.response?.errors?.[0]?.message ?? 'Chyba přihlášení'),
  });

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="mb-6 text-xl font-bold text-gray-900 text-center">
          {mode === 'login' ? 'Přihlášení' : 'Registrace'}
        </h1>
        <form onSubmit={handleSubmit(async (d) => { try { await mutateAsync(d); } catch {} })} className="space-y-4">
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" {...register('email', { required: true })} placeholder="vas@email.cz" />
          </div>
          <div>
            <label className="label">Heslo</label>
            <input className="input" type="password" {...register('password', { required: true, minLength: 8 })} placeholder="••••••••" />
            {errors.password && <p className="text-xs text-red-500 mt-1">Heslo musí mít alespoň 8 znaků</p>}
          </div>
          <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5">
            {isPending ? 'Načítám...' : mode === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          {mode === 'login' ? 'Nemáte účet?' : 'Máte účet?'}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-primary-600 font-medium hover:underline">
            {mode === 'login' ? 'Registrovat se' : 'Přihlásit se'}
          </button>
        </p>
      </div>
    </div>
  );
}
