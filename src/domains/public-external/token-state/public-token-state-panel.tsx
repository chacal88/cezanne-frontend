import type { PublicRouteFamily, PublicTokenState } from '../support/models';

const tokenTitles: Record<PublicTokenState, string> = {
  valid: 'Ready',
  invalid: 'Invalid link',
  expired: 'Expired link',
  used: 'Link already used',
  inaccessible: 'Inaccessible link',
};

const defaultTokenMessages: Record<PublicTokenState, string> = {
  valid: 'This route can continue normally.',
  invalid: 'The link could not be verified. Request a new link and try again.',
  expired: 'This link expired. Request a fresh link to continue.',
  used: 'This link was already completed. You can request a new invitation if needed.',
  inaccessible: 'This route is not available from your current public context.',
};

const familyTokenMessages: Partial<Record<PublicRouteFamily, Partial<Record<PublicTokenState, string>>>> = {
  'external-tokenized-chat': {
    used: 'This chat link is no longer active. Ask the sender to share a new route if the conversation should continue.',
    inaccessible: 'This chat route could not confirm an eligible existing conversation for the shared participant.',
  },
  'external-interview-request': {
    used: 'This interview request already has a final response and remains read-only.',
  },
  'external-review-candidate': {
    used: 'This review token already reached a submitted read-only state.',
  },
  'external-interview-feedback': {
    used: 'This feedback token already reached a submitted read-only state.',
  },
  'integration-cv': {
    used: 'This CV callback already reached a stable read-only state.',
  },
  'integration-forms': {
    used: 'This forms/documents callback already reached a stable read-only state.',
  },
  'integration-job': {
    inaccessible: 'This job callback token does not match the expected integration route family.',
  },
  'requisition-forms-download': {
    used: 'These requisition forms were already downloaded. Request a fresh link if you need another copy.',
    inaccessible: 'This forms link is not authorized for the requested requisition documents.',
    invalid: 'The forms link could not be verified. Request a new requisition forms link.',
    expired: 'This requisition forms link expired. Request a fresh link to download the documents.',
  },
};

export function PublicTokenStatePanel({ family, tokenState, reason }: { family: PublicRouteFamily; tokenState: PublicTokenState; reason?: string }) {
  const message = familyTokenMessages[family]?.[tokenState] ?? defaultTokenMessages[tokenState];

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <h2>{tokenTitles[tokenState]}</h2>
      <p data-testid={`${family}-token-state`}>{tokenState}</p>
      <p>{message}</p>
      {reason ? <p data-testid={`${family}-reason`}>{reason}</p> : null}
    </section>
  );
}
