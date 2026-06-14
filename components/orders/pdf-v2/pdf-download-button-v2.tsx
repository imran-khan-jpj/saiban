"use client";

import * as React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import type { Order } from "@/app/api/orders/use-get-all";
import { Button } from "@/components/ui/button";
import { IconSparkles } from "@tabler/icons-react";
import { OrderPDFV2 } from "./order-pdf-v2";
import { registerPdfHyphenation } from "./hyphenation";

interface PdfDownloadButtonV2Props {
  order: Order;
  customNote: string;
  fileName: string;
  size?: "default" | "lg" | "sm" | "icon";
}

// Guarantees long batch numbers / tokens wrap inside their table cell.
registerPdfHyphenation();

/**
 * Download button for the redesigned (v2) invoice. Code-split via
 * `next/dynamic` so `@react-pdf/renderer` only loads when rendered.
 */
export default function PdfDownloadButtonV2({
  order,
  customNote,
  fileName,
  size,
}: PdfDownloadButtonV2Props) {
  const document = React.useMemo(
    () => (
      <OrderPDFV2
        order={order}
        customNote={customNote}
        parentCompanyLogo="/logos/roots-logo.jpeg"
        companyLogo="/logos/saiban-logo.jpeg"
      />
    ),
    [order, customNote],
  );

  return (
    <PDFDownloadLink document={document} fileName={fileName}>
      {({ loading }) => (
        <Button
          variant="outline"
          disabled={loading}
          size={size}
          className="border-teal-500 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
        >
          <IconSparkles className="h-4 w-4 mr-2" />
          {loading ? "Generating…" : "Invoice PDF (New Design · Beta)"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
