import type { PublicRouteReadiness, PublicTokenState } from '../../support/models';

export const legacyTokenizedChatEndpoints = {
  bootstrap: '/chat/messages/{token}/{user_id}',
  submit: '/chat',
} as const;

export type ExternalChatRouteParams = {
  token: string;
  userId: string;
};

export type ExternalChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'external-participant' | 'recruiter-partner';
  createdAt: string;
  htmlMessage: string;
};

export type ExternalChatMessageGroup = {
  senderId: string;
  senderName: string;
  senderRole: ExternalChatMessage['senderRole'];
  createdAt: string;
  messages: string[];
};

export type ExternalChatDecision = {
  family: 'external-tokenized-chat';
  capabilityKey: 'canUseExternalTokenizedChat';
  tokenState: PublicTokenState;
  readiness: PublicRouteReadiness;
  canProceed: boolean;
  conversationReadiness: 'ready' | 'missing-thread';
  sendReadiness: 'ready' | 'missing-context';
  reason?: string;
};

export type ExternalChatViewModel = {
  route: ExternalChatRouteParams;
  decision: ExternalChatDecision;
  title: string;
  intro: string;
  participantName: string;
  partnerName: string;
  groups: ExternalChatMessageGroup[];
  draft: string;
};

export type ExternalChatSerializedPayload = {
  route: ExternalChatRouteParams;
  participantName: string;
  partnerName: string;
  message: string;
  endpoint: typeof legacyTokenizedChatEndpoints.submit;
};

export type ExternalChatWorkflowResult =
  | {
      status: 'completed';
      payload: ExternalChatSerializedPayload;
      requestHeaders: Record<string, string>;
    }
  | {
      status: 'failed';
      stage: 'bootstrap' | 'validation' | 'submission';
      message: string;
    };

export type ExternalChatNotificationOwnership = {
  family: 'user-mentioned' | 'cv-reviewed' | 'cv-interview-feedback';
  owner: 'inbox' | 'candidate.review' | 'candidate.detail';
  allowsExternalTokenDestination: false;
  reason: string;
};
