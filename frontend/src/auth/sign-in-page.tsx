import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchMe, hasStoredAuthToken, loginWithCredentials, logoutAuthSession } from '@/crm/services/backend';
import { useLanguage } from '@/localization/language-context';

const SESSION_VERIFY_TIMEOUT_MS = 5000;

export function SignInPage() {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('admin@crm.cz');
  const [password, setPassword] = useState('admin123');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const target = searchParams.get('next') || '/core/dashboard';
    return target.startsWith('/auth') ? '/core/dashboard' : target;
  }, [searchParams]);
  const isCs = language === 'cs';

  useEffect(() => {
    let active = true;

    const checkExistingSession = async () => {
      if (!hasStoredAuthToken()) return;
      try {
        await Promise.race([
          fetchMe(),
          new Promise<never>((_, reject) => {
            window.setTimeout(() => reject(new Error('Session verification timed out')), SESSION_VERIFY_TIMEOUT_MS);
          }),
        ]);
        if (active) navigate(nextPath, { replace: true });
      } catch {
        // invalid token -> stay on login and clear stale session
        logoutAuthSession();
      }
    };

    void checkExistingSession();
    return () => {
      active = false;
    };
  }, [navigate, nextPath]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError(isCs ? 'Vyplň email a heslo.' : 'Enter email and password.');
      return;
    }

    try {
      setLoading(true);
      await loginWithCredentials(email.trim(), password);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : isCs ? 'Přihlášení se nepodařilo.' : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .cp-login {
            --cp-green: #7fb343;
            --cp-ink: #404642;
            --cp-ink-soft: #5b625d;
            --cp-button: #404642;
            --cp-button-hover: #343a36;
          }
          .cp-login .cp-brand-card {
            border-color: color-mix(in srgb, var(--cp-ink) 20%, transparent);
            box-shadow: 0 18px 45px rgba(64, 70, 66, 0.12);
          }
          .cp-login .cp-lang-toggle {
            border: 1px solid color-mix(in srgb, var(--cp-ink) 25%, transparent);
          }
          .cp-login .cp-lang-toggle-active {
            background: var(--cp-button);
            color: #fff;
          }
          .cp-login .cp-brand-button {
            background: var(--cp-button);
            color: #fff;
            border: 0;
          }
          .cp-login .cp-brand-button:hover {
            background: var(--cp-button-hover);
          }
          .cp-login .cp-brand-input:focus-visible {
            border-color: color-mix(in srgb, var(--cp-ink-soft) 70%, #fff);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--cp-green) 24%, transparent);
          }
          .auth-branded-bg {
            background: #ffffff;
          }
          .dark .auth-branded-bg {
            background: #ffffff;
          }
        `}
      </style>
      <div className="cp-login grid lg:grid-cols-2 grow min-h-screen">
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          <Card className="cp-brand-card max-w-[370px] w-full">
            <CardContent className="flex flex-col gap-5 p-10">
              <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <div className="flex items-center justify-end gap-1" data-no-localize="true">
                  <button
                    type="button"
                    onClick={() => setLanguage('cs')}
                    className={`cp-lang-toggle h-8 px-2 rounded text-xs font-medium ${isCs ? 'cp-lang-toggle-active' : 'hover:bg-muted'}`}
                  >
                    CZ
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`cp-lang-toggle h-8 px-2 rounded text-xs font-medium ${!isCs ? 'cp-lang-toggle-active' : 'hover:bg-muted'}`}
                  >
                    EN
                  </button>
                </div>

                {error && (
                  <Alert variant="destructive" appearance="light" onClose={() => setError(null)}>
                    <AlertIcon />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <div className="flex flex-col gap-1">
                  <Label className="font-normal text-mono">{isCs ? 'Email' : 'Email'}</Label>
                  <Input
                    className="cp-brand-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isCs ? 'email@email.com' : 'email@email.com'}
                    autoComplete="email"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-1">
                    <Label className="font-normal text-mono">{isCs ? 'Heslo' : 'Password'}</Label>
                  </div>
                  <div className="relative">
                    <Input
                      className="cp-brand-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isCs ? 'Zadejte heslo' : 'Enter password'}
                      autoComplete={remember ? 'current-password' : 'off'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    >
                      {showPassword ? (
                        <EyeOff className="text-muted-foreground" />
                      ) : (
                        <Eye className="text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-secondary-foreground">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                  <span>{isCs ? 'Zapamatovat si mě' : 'Remember me'}</span>
                </label>

                <Button type="submit" className="cp-brand-button" disabled={loading}>
                  {loading ? (isCs ? 'Přihlašuji...' : 'Signing in...') : (isCs ? 'Přihlásit se' : 'Sign in')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:rounded-xl lg:border lg:border-border lg:m-5 order-1 lg:order-2 bg-top xxl:bg-center xl:bg-cover bg-no-repeat auth-branded-bg">
          <div className="flex items-center justify-center p-8 lg:p-16 h-full">
            <Link to="/auth/sign-in">
              <img src={toAbsoluteUrl('/media/app/logo-cp.svg')} className="h-[130px] lg:h-[178px] w-auto max-w-none" alt="Český Partner logo" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
