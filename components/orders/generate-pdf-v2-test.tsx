"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Order } from "@/app/api/orders/use-get-all";
import { Button } from "@/components/ui/button";
import { IconSparkles } from "@tabler/icons-react";
import { buildInvoiceFileName } from "./generate-pdf";
import { DEFAULT_INVOICE_WARRANTY_NOTE } from "./constants";

const PdfDownloadButtonV2 = dynamic(
  () => import("./pdf-v2/pdf-download-button-v2"),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" disabled>
        <IconSparkles className="h-4 w-4 mr-2" />
        Loading new design…
      </Button>
    ),
  },
);

interface GeneratePDFV2TestProps {
  order: Order;
  customNote?: string;
  size?: "default" | "lg" | "sm" | "icon";
}

/**
 * TEMPORARY: side-by-side test button for the redesigned invoice PDF.
 *
 * Renders the new (v2) invoice design so it can be compared against the
 * existing "Download Invoice PDF" button. Remove this component (and its
 * usages on the order detail pages) once the new design is approved and the
 * old PDF is replaced.
 */
export function GeneratePDFV2Test({
  order,
  customNote,
  size = "lg",
}: GeneratePDFV2TestProps) {
  const fileName = React.useMemo(() => buildInvoiceFileName(order), [order]);

  return (
    <PdfDownloadButtonV2
      order={order}
      customNote={customNote || DEFAULT_INVOICE_WARRANTY_NOTE}
      fileName={fileName}
      size={size}
    />
  );
}
