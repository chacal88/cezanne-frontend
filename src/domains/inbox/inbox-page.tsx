import { useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export type InboxSearch = {
  conversation?: string;
};

export function validateInboxSearch(search: Record<string, unknown>): InboxSearch {
  return {
    conversation: typeof search.conversation === 'string' && search.conversation.length > 0 ? search.conversation : undefined,
  };
}

export function InboxPage() {
  const search = useSearch({ strict: false }) as InboxSearch;
  const { t } = useTranslation('inbox');

  return (
    <section>
      <h1>{t('home.title')}</h1>
      <p>{t('home.detail')}</p>
      <p>
        {t('home.activeConversation')}{' '}
        <strong data-testid="inbox-active-conversation">{search.conversation ?? t('home.none')}</strong>
      </p>
    </section>
  );
}
