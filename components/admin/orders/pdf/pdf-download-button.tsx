"use client";

import * as React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import type { Order } from "@/app/api/orders/use-get-all";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import { OrderPDF } from "./order-pdf";

interface PdfDownloadButtonProps {
  order: Order;
  customNote: string;
  fileName: string;
  size?: "default" | "lg" | "sm" | "icon";
}

/**
 * Heavy PDF rendering surface — code-split via `next/dynamic` from the
 * GeneratePDF entry so `@react-pdf/renderer` (and OrderPDF, and the styles)
 * only load when this component is actually rendered.
 */
export default function PdfDownloadButton({
  order,
  customNote,
  fileName,
  size,
}: PdfDownloadButtonProps) {
  const document = React.useMemo(
    () => (
      <OrderPDF
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
        <Button disabled={loading} size={size}>
          <IconDownload className="h-4 w-4 mr-2" />
          {loading ? "Generating..." : "Download Invoice PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
