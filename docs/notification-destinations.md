# Greenfield Frontend Notification Destination Catalog

## Purpose

This document defines the typed destination system for notifications in the greenfield frontend.

It answers:
- which destination kinds exist
- which route each destination resolves to
- which parameters are required
- what fallback behavior applies when access or context is missing

## Source baseline

Synthesized from:
- `./screens.md`
- `./capabilities.md`
- `../../docs/frontend-2/frontend-notification-destination-inventory.md`
- `../../docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `../../frontend/src/app/pages/dashboard/dashboard.route.js`
- `../../frontend/src/app/components/notificationBox/*`

## Design rules

- No opaque `referer` redirects in the target frontend.
- Every navigable notification resolves to a typed destination object.
- Destination resolution happens before rendering the final route.
- If access or entity state is invalid, fallback must also be typed.

## Destination object

Suggested shape:

```ts
NotificationDestination = {
  kind: string,
  params: Record<string, string | number | boolean | null>,
  fallbackKind?: string,
  sourceNotificationKey: string,
}
```

## Destination catalog

| Kind | Target route | Required params | Typical notification keys | Capability gate | Fallback |
|---|---|---|---|---|---|
| `dashboard` | `/dashboard` | none | generic shell-safe fallback | `canViewDashboard` | public auth entry or platform landing |
| `notifications` | `/notifications` | none | shell activity fallback | `canOpenNotifications` | dashboard |
| `inbox.conversation` | `/inbox?conversation=` | `conversationId` | `message` | `canViewInbox`, `canOpenConversation` | inbox without selection, then dashboard |
| `job.detail` | `/job/:id?section` | `jobId`, optional `section` | `job-assigned-to`, `new-job`, `integration-warn`, favorite-related keys | `canViewJobDetail` | jobs list, then dashboard |
| `job.bid.view` | `/job/:id/bid/:bid_id` | `jobId`, `bidId` | `bid-accepted`, `bid-received`, `bid-rejected` | `canOpenJobTask` | `job.detail` |
| `job.cv.view` | `/job/:id/cv/:cv_id` | `jobId`, `cvId` | `cv-accepted`, `cv-accepted-recruiter`, `cv-accepted-integration`, `cv-rejected` | `canOpenJobTask` | `job.detail` |
| `job.schedule` | `/job/:id/cv/:cv_id/schedule` | `jobId`, `cvId` | `interview-scheduled`, `interview-schedule-cancelled` | `canScheduleInterviewFromJob` | `candidate.detail` or `job.detail` |
| `job.offer` | `/job/:id/cv/:cv_id/offer` | `jobId`, `cvId` | `offer-made`, `offer-made-integration`, `offer-accepted`, `offer-rejected` | `canCreateOfferFromJob` | `candidate.detail` or `job.detail` |
| `candidate.detail` | `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?` | `candidateId`, optional `jobId`, optional workflow params | `cv-received`, `cv-received-integration`, `cv-answered-forms`, `interview-accepted`, `interview-rejected`, integration interview variants | `canViewCandidateDetail` | job detail, then dashboard |
| `billing.overview` | `/billing` | none | commercial notifications such as subscription/trial/info | `canViewBilling` | dashboard |

## Unsupported legacy patterns to eliminate

The following current patterns must not survive into greenfield as-is:
- raw `referer` URL redirects for `cv-interview-feedback`, `cv-reviewed`, `user-mentioned`
- duplicated route-switch logic in both dashboard and notification templates
- destination families that vary by template but not by typed contract

## Replacement plan for legacy opaque keys

| Legacy key family | Current state | Greenfield treatment |
|---|---|---|
| `cv-interview-feedback` | raw `referer` | map to typed `candidate.detail` or explicit future review destination |
| `cv-reviewed` | raw `referer` | map to typed candidate/review destination |
| `user-mentioned` | raw `referer` | map to typed entity destination or inbox conversation |
| informational/no-link notifications | non-navigating | allow `kind = informational` with no route |

## Resolver contract

The resolver should:
1. normalize notification payload into a typed destination
2. evaluate capability gates
3. redirect to the typed fallback if denied or missing
4. never emit a browser-level opaque redirect

## Planning rule

No notification key may be considered migrated until it resolves through this catalog or an approved extension of it.
