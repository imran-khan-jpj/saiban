"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Order } from "@/app/api/orders/use-get-all";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconDownload } from "@tabler/icons-react";
import { formatDate } from "@/lib/utils";
import { DEFAULT_INVOICE_WARRANTY_NOTE } from "./constants";

const PdfDownloadButton = dynamic(() => import("./pdf/pdf-download-button"), {
  ssr: false,
  loading: () => (
    <Button disabled>
      <IconDownload className="h-4 w-4 mr-2" />
      Loading PDF…
    </Button>
  ),
});

interface GeneratePDFProps {
  order: Order;
  customNote?: string;
  onNoteChange?: (note: string) => void;
  buttonOnly?: boolean;
  textareaOnly?: boolean;
}

const defaultNote = DEFAULT_INVOICE_WARRANTY_NOTE;

const FILENAME_INVALID_CHARS = /[\\/:*?"<>|]/g;

/** Title-case ("ashraf centre" -> "Ashraf Centre") + collapse repeated spaces. */
function titleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

/** Strip filesystem-reserved characters and collapse whitespace. */
function sanitizeForFilename(text: string): string {
  return text.replace(FILENAME_INVALID_CHARS, "").replace(/\s+/g, " ").trim();
}

/**
 * Build a friendly invoice PDF filename.
 *
 * Format: `Saiban Invoice {InvoiceNumber} - {Customer Name} - {YYYY-MM-DD}.pdf`
 *
 * Examples:
 * - `Saiban Invoice INV-2026-001 - Ashraf Centre Dr Rahmatullah Sahab - 2026-04-30.pdf`
 * - `Saiban Invoice ORD-A1B2C3 - Sajjad Homeo Store - 2026-04-29.pdf`
 *
 * The customer is title-cased, illegal filesystem characters are stripped, and
 * the date is in ISO format so the file sorts naturally in a folder.
 */
export function buildInvoiceFileName(order: Order): string {
  const date = formatDate(order.createdAt, "YYYY-MM-DD");

  const fullName = `${order.customerId.firstName ?? ""} ${
    order.customerId.lastName ?? ""
  }`.trim();
  const customerName =
    sanitizeForFilename(titleCase(fullName)) || "Customer";

  const invoiceId = order.invoiceNumber?.trim()
    ? sanitizeForFilename(order.invoiceNumber)
    : `ORD-${order._id.slice(-6).toUpperCase()}`;

  return `Saiban Invoice ${invoiceId} - ${customerName} - ${date}.pdf`;
}

export function GeneratePDF({
  order,
  customNote: controlledNote,
  onNoteChange,
  buttonOnly = false,
  textareaOnly = false,
}: GeneratePDFProps) {
  const [internalNote, setInternalNote] = React.useState(defaultNote);

  const customNote =
    controlledNote !== undefined ? controlledNote : internalNote;

  const handleNoteChange = (value: string) => {
    if (onNoteChange) {
      onNoteChange(value);
    } else {
      setInternalNote(value);
    }
  };

  const fileName = React.useMemo(
    () => buildInvoiceFileName(order),
    [order],
  );

  if (buttonOnly) {
    return (
      <PdfDownloadButton
        order={order}
        customNote={customNote || defaultNote}
        fileName={fileName}
      />
    );
  }

  if (textareaOnly) {
    return (
      <div className="space-y-2 p-[1px]">
        <Textarea
          id="customNote"
          placeholder="Enter any additional notes to include in the invoice..."
          value={customNote}
          onChange={(e) => handleNoteChange(e.target.value)}
          rows={5}
          className="z-20"
        />
        <p className="text-xs text-muted-foreground">
          This note will appear at the bottom left of the invoice
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg bg-card max-w-4xl">
      <div className="space-y-2 flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="customNote">Warranty (Optional)</Label>
          <Textarea
            id="customNote"
            placeholder="Enter any additional notes to include in the invoice..."
            value={customNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            This note will appear at the bottom left of the invoice
          </p>
        </div>
        <PdfDownloadButton
          order={order}
          customNote={customNote}
          fileName={fileName}
          size="lg"
        />
      </div>
    </div>
  );
}
