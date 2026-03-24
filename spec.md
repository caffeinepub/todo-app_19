# TaskFlow Todo App

## Current State
The app has a header with non-functional nav links (Features, Pricing, Blog) and a large footer with multiple link columns (Product, Company, Legal) plus social icons -- all non-functional. The backend already correctly scopes todos per caller principal, so task privacy is already enforced.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- AppHeader: remove the nav links (Features, Pricing, Blog)
- AppFooter: remove the multi-column link sections; keep only the brand blurb and Caffeine attribution

### Remove
- navLinks array and ocidMap in AppHeader
- footerLinks object and link columns in AppFooter
- Social icon imports and buttons in AppFooter

## Implementation Plan
1. Update AppHeader to remove nav links section entirely
2. Update AppFooter to simplify to brand + copyright line only
