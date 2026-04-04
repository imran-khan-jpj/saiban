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
  // Company Header with Logos
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottom: "2pt solid #000",
    paddingBottom: 8,
  },
  logo: {
    width: 120,
    height: 120,
    objectFit: "contain",
  },
  companyHeader: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 10,
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
    justifyContent: "space-between",
    marginBottom: 10,
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
    width: "5%",
    textAlign: "center",
  },
  colItem: {
    width: "20%",
  },
  colBatchNo: {
    width: "10%",
    textAlign: "center",
  },
  colPacking: {
    width: "10%",
    textAlign: "center",
  },
  colQty: {
    width: "7%",
    textAlign: "right",
  },
  colRetail: {
    width: "11%",
    textAlign: "right",
  },
  colDisc: {
    width: "7%",
    textAlign: "right",
  },
  colDiscPrice: {
    width: "11%",
    textAlign: "right",
  },
  colNetValue: {
    width: "19%",
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
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1pt solid #ddd",
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 10,
  },
  totalItems: {
    fontSize: 10,
    fontWeight: "bold",
    flexDirection: "row",
    alignItems: "center",
  },
  invoiceGrossContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  invoiceGrossLabel: {
    fontSize: 10,
  },
  invoiceGrossValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 15,
  },
  summaryBox: {
    width: "40%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  summaryDivider: {
    borderBottom: "1pt solid #ddd",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 9,
  },
  summaryValue: {
    fontSize: 9,
    textAlign: "right",
  },
  netPayableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  netPayableLabel: {
    fontSize: 10,
    fontWeight: "bold",
    flexDirection: "row",
    alignItems: "center",
  },
  netPayableValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  dispatchSection: {
    alignItems: "center",
    marginTop: 10,
  },
  dispatchLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 4,
  },
  signatureLine: {
    width: 200,
    borderBottom: "1pt solid #000",
    marginTop: 20,
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
        {/* Company Header with Logos */}
        <View style={styles.headerContainer} fixed>
          {/* Left Logo */}
          {parentCompanyLogo && (
            <Image src={parentCompanyLogo} style={styles.logo} />
          )}

          {/* Company Info */}
          <View style={styles.companyHeader}>
            <Text style={styles.companyName}>Saiban Homoeopathic Pharma</Text>
            <Text style={styles.companyDetails}>
              Email: saqibch51700@gmail.com
            </Text>
            <Text style={styles.companyDetails}>Phone number: 03167072121</Text>

            <Text style={styles.companyDetails}>
              Mfg. By/Root's Pharma Lahore
            </Text>
            <Text style={styles.companyDetails}>DRAP ENLISTMENT #00553</Text>
          </View>

          {/* Right Logo */}
          {companyLogo && (
            <Image
              src={companyLogo}
              style={{ height: 100, width: 100, objectFit: "contain" }}
            />
          )}
        </View>

        {/* Invoice and Customer Boxes */}
        <View style={styles.topBoxesContainer}>
          {/* Invoice Box */}
          <View style={styles.invoiceBox}>
            <Text style={styles.boxTitle}>INVOICE</Text>

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
                <Text style={styles.boxLabel}>Phone:</Text>
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
            <Text style={[styles.tableHeaderText, styles.colBatchNo]}>
              Batch No
            </Text>
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
              <Text style={[styles.tableRowText, styles.colBatchNo]}>
                {item.productId.batchNo || "-"}
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
            <Text style={[styles.tableRowText, styles.colBatchNo]}></Text>
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
        <View style={styles.bottomSection} wrap={false}>
          {/* Top Row - Total Items and Invoice Gross Value */}
          <View style={styles.topRow}>
            <Text style={styles.totalItems}>
              Total Items: {order.items.length}
            </Text>
            <View style={styles.invoiceGrossContainer}>
              <Text style={styles.invoiceGrossLabel}>Invoice Gross Value</Text>
              <Text style={styles.invoiceGrossValue}>
                {formatCurrency(order.subtotal)}
              </Text>
            </View>
          </View>

          {/* Summary Box */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <View style={styles.summaryDivider} />

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

              <View style={styles.summaryDivider} />

              <View style={styles.netPayableRow}>
                <Text style={styles.netPayableLabel}>✓ Net Payable:</Text>
                <Text style={styles.netPayableValue}>
                  {formatCurrency(order.grandTotal)}
                </Text>
              </View>
            </View>
          </View>

          {/* Dispatch Officer Section */}
          <View style={styles.dispatchSection}>
            <Text style={styles.dispatchLabel}>Dispatch Officer</Text>
            <View style={styles.signatureLine} />
          </View>
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
  const parentCompanyLogo = "/logos/roots-logo.jpeg"; // Parent company logo
  const companyLogo = "/logos/saiban-logo.jpeg"; // Company logo

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
            <Button className="" disabled={loading} size="lg">
              <IconDownload className="h-4 w-4 mr-2" />
              {loading ? "Generating PDF..." : "Download Invoice PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
}
