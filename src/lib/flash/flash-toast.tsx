import { useEffect, useState } from 'react';
import './flash-toast.css';

export type FlashMessage = {
  kind: 'success' | 'error';
  title?: string;
  message: string;
};

const flashStorageKey = 'recruit.flashMessage';
const legacyAuthFlashStorageKey = 'recruit.authFlash';

export function storeFlashMessage(flash: FlashMessage) {
  window.sessionStorage.setItem(flashStorageKey, JSON.stringify(flash));
}

function parseFlash(raw: string | null): FlashMessage | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<FlashMessage>;
    if ((parsed.kind === 'success' || parsed.kind === 'error') && parsed.message) return parsed as FlashMessage;
  } catch {
    return null;
  }
  return null;
}

function readStoredFlashMessage(): FlashMessage | null {
  return parseFlash(window.sessionStorage.getItem(flashStorageKey))
    ?? parseFlash(window.sessionStorage.getItem(legacyAuthFlashStorageKey));
}

export function clearStoredFlashMessage() {
  window.sessionStorage.removeItem(flashStorageKey);
  window.sessionStorage.removeItem(legacyAuthFlashStorageKey);
}

export function useStoredFlashMessage(): FlashMessage | null {
  const [flash] = useState<FlashMessage | null>(() => readStoredFlashMessage());

  useEffect(() => {
    clearStoredFlashMessage();
  }, []);

  return flash;
}

export function FlashToast({ flash, testId = 'flash-toast' }: { flash: FlashMessage | null; testId?: string }) {
  if (!flash) return null;
  const icon = flash.kind === 'success' ? 'fas fa-check' : 'fas fa-exclamation';

  return (
    <aside className={`flash-toast flash-toast--${flash.kind}`} role="alert" data-testid={testId}>
      <i className={icon} aria-hidden="true" />
      <div>
        {flash.title ? <strong>{flash.title}</strong> : null}
        <span>{flash.message}</span>
      </div>
    </aside>
  );
}
