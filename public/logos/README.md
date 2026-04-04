# Company Logos

This directory contains the company logos used in PDF invoice generation.

## Required Files

1. **parent-company.png** - Parent company logo (displayed on the left side of invoices)
2. **company.png** - Main company logo (displayed on the right side of invoices)

## Logo Requirements

- Format: PNG (recommended) or JPG
- Recommended size: 200x200 pixels or larger
- Aspect ratio: Square or similar dimensions work best
- Background: Transparent PNG recommended for professional appearance

## How to Add Logos

1. Place your parent company logo as `parent-company.png` in this directory
2. Place your main company logo as `company.png` in this directory
3. Make sure the file names match exactly (case-sensitive)

## Updating Logo Paths

If you want to use different file names or formats, update the logo paths in:
`/components/admin/orders/generate-pdf.tsx`

Look for these lines:

```typescript
const parentCompanyLogo = "/logos/parent-company.png";
const companyLogo = "/logos/company.png";
```

And update them to match your file names.
