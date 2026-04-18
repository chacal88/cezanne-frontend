import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type PublicRoutePageProps = {
  title: string;
  detail: ReactNode;
};

function PublicRoutePage({ title, detail }: PublicRoutePageProps) {
  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <div>{detail}</div>
    </section>
  );
}

export function PublicHomePage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('publicHome.title')} detail={t('publicHome.detail')} />;
}

export function ConfirmRegistrationPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('confirmRegistration.title')} detail={t('confirmRegistration.detail')} />;
}

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('forgotPassword.title')} detail={t('forgotPassword.detail')} />;
}

export function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('resetPassword.title')} detail={t('resetPassword.detail')} />;
}

export function RegisterPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('register.title')} detail={t('register.detail')} />;
}

export function CezanneAuthPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('cezanneAuth.title')} detail={t('cezanneAuth.detail')} />;
}

export function CezanneCallbackPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('cezanneCallback.title')} detail={t('cezanneCallback.detail')} />;
}

export function SamlCallbackPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('samlCallback.title')} detail={t('samlCallback.detail')} />;
}

export function InviteTokenPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('inviteToken.title')} detail={t('inviteToken.detail')} />;
}

export function LogoutPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('logout.title')} detail={t('logout.detail')} />;
}

export function ProfilePlaceholderPage({ titleKey }: { titleKey: 'profilePlaceholder.hiringCompanyTitle' | 'profilePlaceholder.recruitmentAgencyTitle' }) {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t(titleKey)} detail={t('profilePlaceholder.detail')} />;
}

export function AccessDeniedPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('accessDenied.title')} detail={t('accessDenied.detail')} />;
}
