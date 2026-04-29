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

  const fileName = React.useMemo(() => {
    const day = formatDate(order.createdAt, "DD");
    const month = formatDate(order.createdAt, "MMM").toLowerCase();
    const customerName =
      `${order.customerId.firstName}-${order.customerId.lastName}`.toLowerCase();
    return `${customerName}-${day}-${month}-invoice.pdf`;
  }, [order]);

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
