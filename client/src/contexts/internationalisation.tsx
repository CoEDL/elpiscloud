import {useRouter} from 'next/router';
import {IntlProvider as _IntlProvider} from 'react-intl';
import flatten from 'flat';
import common_en from 'i18n/en-GB/common.json';
import common_fr from 'i18n/fr/common.json';

interface AuthProps {
  children: React.ReactNode;
}

const messages: {[key: string]: {}} = {
  en: common_en,
  fr: common_fr,
};

const FALLBACK_DEFAULT_LOCALE = 'en';

export function IntlProvider({children}: AuthProps) {
  const router = useRouter();
  const locale =
    router.locale || router.defaultLocale || FALLBACK_DEFAULT_LOCALE;

  return (
    <_IntlProvider locale={locale} messages={flatten(messages[locale])}>
      {children}
    </_IntlProvider>
  );
}
