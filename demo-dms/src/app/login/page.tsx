'use client';

import {Suspense, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';
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
  const { isAuthenticated, isLoading, login } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  // Nếu đã authenticated → redirect về intended URL hoặc home
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    }
  }, [isAuthenticated, searchParams, router]);
  
  // Nếu đang load auth state → hiển thị loading
  if (isLoading) {
    return <FullscreenLoading message={tCommon('checkingSession')} />;
  }
  
  // Nếu đang redirect tới Keycloak → hiển thị loading
  if (isRedirecting) {
    return <FullscreenLoading message={t('redirecting')} />;
  }
  
  const handleLogin = async () => {
    setIsRedirecting(true);

    const redirectPath = searchParams.get('redirect') || '/';
    // Prototype Doanh nghiệp A: bỏ Keycloak, đăng nhập thẳng vào hệ thống.
    if (typeof window !== 'undefined') {
      localStorage.setItem('pkkq_authenticated', 'true');
      router.replace(redirectPath);
    } else {
      await login(redirectPath);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-xl shadow-lg">
        <CardHeader className="space-y-4 text-center">
          {/* Language switcher */}
          <div className="flex justify-end">
            <LanguageSwitcher />
          </div>

          {/* Logo */}
          <div className="mx-auto">
            <SystemLogo size={96} />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
              {t('systemTitle')}
              </h1>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Description */}
          <p className="text-center text-sm text-muted-foreground">
            {t('loginDescription')}
          </p>
          
          {/* Login Button */}
          <Button 
            onClick={handleLogin}
            variant="default" 
            size="lg" 
            className="w-full"
          >
              {t('loginButton')}
          </Button>
          
          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          
          {/* Footer */}
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
