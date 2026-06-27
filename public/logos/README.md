# Company Logos

This directory contains the company logos used in PDF invoice generation.

## Required Files

1. **roots-logo.jpeg** — Parent company (Root's Pharma) logo, displayed on the left side of invoices
2. **saiban-logo.jpeg** — Main company (Saiban) logo, displayed on the right side of invoices

## Logo Requirements

- Format: JPG or PNG
- Recommended size: 200x200 pixels or larger
- Aspect ratio: Square or similar dimensions work best

## How to Add Logos

1. Place the parent company logo as `roots-logo.jpeg` in this directory
2. Place the main company logo as `saiban-logo.jpeg` in this directory
3. Make sure the file names match exactly (case-sensitive)

## Updating Logo Paths

If you want to use different file names or formats, update the logo paths in:
`/components/orders/pdf-v2/pdf-download-button-v2.tsx`

Look for these lines:

```tsx
parentCompanyLogo="/logos/roots-logo.jpeg"
companyLogo="/logos/saiban-logo.jpeg"
```

And update them to match your file names. The on-page logo dimensions are
controlled by the `logo` style in `/components/orders/pdf-v2/styles.ts`.
