"use client";

import * as React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import { Order } from "@/app/api/orders/use-get-all";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconDownload } from "@tabler/icons-react";
import { formatDate, formatCurrency } from "@/lib/utils";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  // Company Header
  companyHeader: {
    textAlign: "center",
    marginBottom: 10,
    borderBottom: "2pt solid #000",
    paddingBottom: 8,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  companyDetails: {
    fontSize: 7,
    marginBottom: 1,
  },
  // Invoice and Customer boxes
  topBoxesContainer: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 10,
  },
  invoiceBox: {
    width: "48%",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 6,
    padding: 8,
  },
  customerBox: {
    width: "48%",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 6,
    padding: 8,
  },
  boxTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  boxRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  boxLabel: {
    fontSize: 8,
    fontWeight: "bold",
    width: "30%",
  },
  boxValue: {
    fontSize: 8,
    width: "70%",
  },
  // Table styles
  table: {
    borderWidth: 2,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "2pt solid #000",
    backgroundColor: "#fff",
    padding: 4,
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    padding: 4,
  },
  tableRowText: {
    fontSize: 8,
  },
  // Table columns
  colSrNo: {
    width: "6%",
    textAlign: "center",
  },
  colItem: {
    width: "24%",
  },
  colPacking: {
    width: "12%",
    textAlign: "center",
  },
  colQty: {
    width: "8%",
    textAlign: "right",
  },
  colRetail: {
    width: "12%",
    textAlign: "right",
  },
  colDisc: {
    width: "8%",
    textAlign: "right",
  },
  colDiscPrice: {
    width: "12%",
    textAlign: "right",
  },
  colNetValue: {
    width: "18%",
    textAlign: "right",
  },
  // Totals row
  totalsRow: {
    flexDirection: "row",
    borderTop: "2pt solid #000",
    padding: 4,
    fontWeight: "bold",
  },
  // Bottom section
  bottomSection: {
    flexDirection: "row",
    marginTop: 10,
    borderTop: "2pt solid #000",
    paddingTop: 8,
  },
  bottomLeft: {
    width: "33%",
    paddingRight: 10,
  },
  bottomCenter: {
    width: "33%",
    paddingRight: 10,
  },
  bottomRight: {
    width: "34%",
  },
  bottomLabel: {
    fontSize: 8,
    marginBottom: 4,
  },
  bottomValue: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 8,
    textAlign: "right",
  },
  // Footer
  warrantySection: {
    marginTop: 10,
    paddingTop: 8,
    borderTop: "1pt solid #000",
  },
  warrantyTitle: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  warrantyText: {
    fontSize: 6,
    textAlign: "center",
    lineHeight: 1.3,
  },
  automatedBy: {
    fontSize: 6,
    textAlign: "center",
    color: "#666",
    marginTop: 4,
  },
});

interface OrderPDFProps {
  order: Order;
  customNote?: string;
  parentCompanyLogo?: string;
  companyLogo?: string;
}

// PDF Document Component
const OrderPDF = ({
  order,
  customNote,
  parentCompanyLogo,
  companyLogo,
}: OrderPDFProps) => {
  // Calculate totals
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalRetail = order.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={styles.companyHeader} fixed>
          <Text style={styles.companyName}>YOUR COMPANY NAME</Text>
          <Text style={styles.companyDetails}>
            Head Office: Your Address Here
          </Text>
          <Text style={styles.companyDetails}>
            Factory: Your Factory Address | Ph: Your Phone Number
          </Text>
        </View>

        {/* Invoice and Customer Boxes */}
        <View style={styles.topBoxesContainer}>
          {/* Invoice Box */}
          <View style={styles.invoiceBox}>
            <Text style={styles.boxTitle}>INVOICE</Text>
            <View style={styles.boxRow}>
              <Text style={styles.boxLabel}>No:</Text>
              <Text style={styles.boxValue}>{order._id}</Text>
            </View>
            <View style={styles.boxRow}>
              <Text style={styles.boxLabel}>Date:</Text>
              <Text style={styles.boxValue}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>

          {/* Customer Box */}
          <View style={styles.customerBox}>
            <View style={styles.boxRow}>
              <Text style={styles.boxLabel}>Name:</Text>
              <Text style={styles.boxValue}>
                {order.customerId.firstName} {order.customerId.lastName}
              </Text>
            </View>
            <View style={styles.boxRow}>
              <Text style={styles.boxLabel}>Email:</Text>
              <Text style={styles.boxValue}>{order.customerId.email}</Text>
            </View>
            {order.customerId.phoneNumber && (
              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>Ph:</Text>
                <Text style={styles.boxValue}>
                  {order.customerId.phoneNumber}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colSrNo]}>Sr No</Text>
            <Text style={[styles.tableHeaderText, styles.colItem]}>Item</Text>
            <Text style={[styles.tableHeaderText, styles.colPacking]}>
              Packing
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colRetail]}>
              Retail
            </Text>
            <Text style={[styles.tableHeaderText, styles.colDisc]}>Disc %</Text>
            <Text style={[styles.tableHeaderText, styles.colDiscPrice]}>
              Disc Price
            </Text>
            <Text style={[styles.tableHeaderText, styles.colNetValue]}>
              Net Value
            </Text>
          </View>

          {/* Table Rows */}
          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableRowText, styles.colSrNo]}>
                {index + 1}
              </Text>
              <Text style={[styles.tableRowText, styles.colItem]}>
                {item.productId.name}
              </Text>
              <Text style={[styles.tableRowText, styles.colPacking]}>
                {item.productId.packType || "-"}
              </Text>
              <Text style={[styles.tableRowText, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableRowText, styles.colRetail]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableRowText, styles.colDisc]}>
                {item.discountPercentage}
              </Text>
              <Text style={[styles.tableRowText, styles.colDiscPrice]}>
                {formatCurrency(
                  item.unitPrice -
                    (item.unitPrice * item.discountPercentage) / 100,
                )}
              </Text>
              <Text style={[styles.tableRowText, styles.colNetValue]}>
                {formatCurrency(item.lineTotal)}
              </Text>
            </View>
          ))}

          {/* Totals Row */}
          <View style={styles.totalsRow}>
            <Text style={[styles.tableRowText, styles.colSrNo]}></Text>
            <Text style={[styles.tableRowText, styles.colItem]}></Text>
            <Text
              style={[
                styles.tableRowText,
                styles.colPacking,
                { fontWeight: "bold" },
              ]}
            >
              Totals:
            </Text>
            <Text
              style={[
                styles.tableRowText,
                styles.colQty,
                { fontWeight: "bold" },
              ]}
            >
              {totalQty}
            </Text>
            <Text style={[styles.tableRowText, styles.colRetail]}></Text>
            <Text style={[styles.tableRowText, styles.colDisc]}></Text>
            <Text style={[styles.tableRowText, styles.colDiscPrice]}></Text>
            <Text
              style={[
                styles.tableRowText,
                styles.colNetValue,
                { fontWeight: "bold" },
              ]}
            >
              {formatCurrency(order.grandTotal)}
            </Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Left Column - Additional Info */}
          <View style={styles.bottomLeft}>
            <Text style={styles.bottomLabel}>Transporter:</Text>
            <Text style={styles.bottomLabel}>Bilty No.:</Text>
            <Text style={styles.bottomLabel}>No Of Carton.:</Text>
            <Text style={styles.bottomLabel}>No of Bundles.:</Text>
          </View>

          {/* Center Column - Summary */}
          <View style={styles.bottomCenter}>
            <Text style={styles.bottomValue}>
              Total Items: {order.items.length}
            </Text>
            <View style={{ marginTop: 10 }}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Invoice Gross Value</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(order.subtotal)}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Column - Payment Summary */}
          <View style={styles.bottomRight}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.summaryValue}>
                -{formatCurrency(order.discountTotal)}
              </Text>
            </View>
            {order.gstTotal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>GST:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(order.gstTotal)}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.summaryRow,
                { borderTop: "1pt solid #000", paddingTop: 4, marginTop: 4 },
              ]}
            >
              <Text style={[styles.summaryLabel, { fontSize: 9 }]}>
                Net Payable:
              </Text>
              <Text style={[styles.summaryValue, { fontSize: 9 }]}>
                {formatCurrency(order.grandTotal)}
              </Text>
            </View>
            <Text style={[styles.bottomLabel, { marginTop: 8 }]}>
              Dispatch Officer:
            </Text>
          </View>
        </View>

        {/* Warranty/Note Section */}
        <View style={styles.warrantySection}>
          {customNote && (
            <>
              <Text style={styles.warrantyTitle}>NOTE</Text>
              <Text style={styles.warrantyText}>{customNote}</Text>
            </>
          )}
          {order.note && (
            <>
              <Text style={[styles.warrantyTitle, { marginTop: 6 }]}>
                ORDER NOTE
              </Text>
              <Text style={styles.warrantyText}>{order.note}</Text>
            </>
          )}
          <Text style={styles.automatedBy}>
            Generated by Your Company Management System
          </Text>
        </View>
      </Page>
    </Document>
  );
};

interface GeneratePDFProps {
  order: Order;
}

export function GeneratePDF({ order }: GeneratePDFProps) {
  const [customNote, setCustomNote] = React.useState("");
  const [isClient, setIsClient] = React.useState(false);

  // Logo URLs - Replace these with your actual logo URLs or set to empty string if not available
  const parentCompanyLogo = ""; // "/logos/parent-company.png" - Add path when logo is available
  const companyLogo = ""; // "/logos/company.png" - Add path when logo is available

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="space-y-2">
        <Label htmlFor="customNote">Custom Note (Optional)</Label>
        <Textarea
          id="customNote"
          placeholder="Enter any additional notes to include in the invoice..."
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          This note will appear at the bottom left of the invoice
        </p>
      </div>

      {isClient && (
        <PDFDownloadLink
          document={
            <OrderPDF
              order={order}
              customNote={customNote}
              parentCompanyLogo={parentCompanyLogo}
              companyLogo={companyLogo}
            />
          }
          fileName={`invoice-${order._id}.pdf`}
        >
          {({ loading }) => (
            <Button className="w-full" disabled={loading} size="lg">
              <IconDownload className="h-4 w-4 mr-2" />
              {loading ? "Generating PDF..." : "Download Invoice PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
}
