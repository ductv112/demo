import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';
import {routing} from './routing';

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get('locale')?.value || routing.defaultLocale;
  
  // Validate locale
  const validLocale = routing.locales.includes(locale as 'vi') ? locale : routing.defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../../messages/${validLocale}.json`)).default
  };
});
