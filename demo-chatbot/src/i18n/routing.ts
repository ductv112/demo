import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['vi'],
  defaultLocale: 'vi',
  localePrefix: 'never'  // Không thêm /vi/ hay /ja/ vào URL
});
