'use client';

import {Suspense, useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Button} from '@/components/ui/button';

import {SystemLogo} from '@/components/system-logo';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {FullscreenLoading} from '@/components/fullscreen-loading';
import {useAuth} from '@/contexts/auth-context';
import {LanguageSwitcher} from '@/components/language-switcher';
import {useTranslations} from 'next-intl';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  // Prototype: luôn authenticated → redirect ngay
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    }
  }, [isAuthenticated, searchParams, router]);

  if (isLoading) {
    return <FullscreenLoading message={tCommon('checkingSession')} />;
  }

  const handleLogin = () => {
    const redirectPath = searchParams.get('redirect') || '/';
    router.replace(redirectPath);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-end">
            <LanguageSwitcher />
          </div>

          <div className="mx-auto">
            <SystemLogo size={96} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">
              {t('systemTitle')}
            </h1>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-center text-sm text-muted-foreground">
            {t('loginDescription')}
          </p>

          <Button
            onClick={handleLogin}
            variant="default"
            size="lg"
            className="w-full"
          >
            {t('loginButton')}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {t('orgFooter')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations('auth');
  return (
    <Suspense fallback={<FullscreenLoading message={t('loading')} />}>
      <LoginPageContent />
    </Suspense>
  );
}
