# Greenfield Frontend Access Model

## Purpose

This document defines the canonical access model for the greenfield frontend.

It answers:
- which access categories exist
- how they differ
- how they combine into route and action decisions
- how precedence and conflicts are resolved

## Source baseline

Synthesized from:
- `./capabilities.md`
- `./screens.md`
- `../../docs/frontend-2/frontend-permission-decision-model.md`
- `../../docs/frontend-2/frontend-feature-flag-to-screen-matrix.md`
- `../../docs/frontend-2/frontend-role-to-screen-matrix.md`
- `../../frontend/src/app/domain/login/login.service.js`

## Access categories

### A1. Identity predicates

Who the user is:
- `authenticated`
- `public`
- `hc`
- `ra`
- `admin`
- `sysAdmin`

### A2. Pivot entitlements

Organization/user assignment visibility:
- `seeJobRequisition`
- `seeCandidates`
- `seeRecruiters`
- `seeFavorites`
- `seeFormsDocs`
- `seeContracts`

### A3. Subscription capabilities

Commercial/product availability:
- `jobRequisition`
- `formsDocs`
- `interviewFeedback`
- `calendarIntegration`
- `bulkSchedule`
- `candidateTags`
- `booleanSearch`
- `recruiters`
- `rejectionReason`
- `contractSigner`
- `billingHidden`
- related commercial toggles

### A4. Rollout / beta flags

Incremental rollout:
- `surveysBeta`
- `customFieldsBeta`
- `sourceReportsBeta`
- `smsBeta`
- `blindReviewBeta`
- related future rollout flags

### A5. Display/config hints

Not permissions:
- VAT values
- settings fragments
- available contracts counts
- coordinates

## Precedence rules

1. **Identity first**
   - if identity fails, deny route before any finer-grained evaluation
2. **Pivot entitlement before action**
   - if the user cannot see the product slice, do not evaluate detailed actions
3. **Subscription capability before rollout**
   - rollout cannot enable a feature the subscription/entitlement does not allow
4. **Entity/context before action**
   - action capability is meaningless if the underlying entity route is denied
5. **Display hints never grant access**
   - values like VAT/settings fragments cannot be used as authorization

## Decision model

| Decision surface | Uses identity | Uses pivot | Uses subscription | Uses rollout | Uses entity context |
|---|---|---|---|---|---|
| nav visibility | yes | often | often | sometimes | rarely |
| route entry | yes | often | often | sometimes | often |
| hub section visibility | yes | often | often | often | often |
| action availability | yes | often | often | often | yes |
| visual/config shaping | yes/no | sometimes | sometimes | sometimes | sometimes |

## Representative examples

### Jobs navigation

Requires:
- `hc`
- plus one of two menu shapes:
  - basic jobs when `!jobRequisition OR !seeJobRequisition`
  - grouped jobs + requisitions when `jobRequisition AND seeJobRequisition`

### Candidate database

Requires:
- `hc`
- `seeCandidates`
- optional enhancements from `booleanSearch`, `candidateTags`

### Billing

Requires:
- `hc`
- `admin`
- `!billingHidden`

### Diversity questions

Requires:
- `hc`
- `admin`
- `surveysBeta`
- `customSurveys`

## Deny behavior rules

| Deny cause | Expected treatment |
|---|---|
| identity mismatch | redirect to public auth or platform landing |
| nav-only unavailable | hide item |
| route unavailable but user is authenticated | dashboard or stable parent fallback |
| action unavailable inside visible route | disable or hide with explanation |
| token invalid/expired | explicit token error state |

## Greenfield simplification rule

The target frontend may simplify the implementation, but it may not collapse these categories back into one undifferentiated `feature()` check.
