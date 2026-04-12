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
    borderBottom: "1pt solid #000",
    marginBottom: 2,
    // padding: 4,
    padding: 0,
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
    paddingVertical: 2,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 1,
  },
  companyDetails: {
    fontSize: 7,
    marginBottom: 0.5,
  },
  // Invoice and Customer boxes
  topBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 4,
  },
  invoiceBox: {
    width: "49%",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    padding: 8,
  },
  customerBox: {
    width: "49%",
    borderWidth: 1,
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
    width: "30%",
  },
  boxValue: {
    fontSize: 8,
    fontWeight: "bold",
    width: "70%",
  },
  // Table styles
  table: {
    borderWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    backgroundColor: "#fff",
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    padding: 4,
    borderRight: "1pt solid #000",
  },
  tableHeaderTextLast: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    padding: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
  },
  tableRowText: {
    fontSize: 8,
    padding: 4,
    borderRight: "1pt solid #000",
  },
  tableRowTextLast: {
    fontSize: 8,
    padding: 4,
  },
  // Table columns
  colSrNo: {
    width: "4%",
    textAlign: "center",
  },
  colItem: {
    width: "15%",
    textAlign: "left",
  },
  colBatchNo: {
    width: "8%",
    textAlign: "left",
  },
  colPacking: {
    width: "8%",
    textAlign: "left",
  },
  colMfgDate: {
    width: "8%",
    textAlign: "left",
  },
  colExpDate: {
    width: "8%",
    textAlign: "left",
  },
  colQty: {
    width: "6%",
    textAlign: "right",
  },
  colRetail: {
    width: "10%",
    textAlign: "right",
  },
  colDisc: {
    width: "6%",
    textAlign: "right",
  },
  colDiscPrice: {
    width: "10%",
    textAlign: "right",
  },
  colNetValue: {
    width: "17%",
    textAlign: "right",
  },
  // Totals row
  totalsRow: {
    flexDirection: "row",
    fontWeight: "bold",
  },
  totalsRowText: {
    fontSize: 8,
    padding: 4,
    borderRight: "1pt solid #000",
    fontWeight: "bold",
  },
  totalsRowTextLast: {
    fontSize: 8,
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
    alignItems: "flex-start",
    borderTop: "1pt solid #000",
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
    justifyContent: "space-between",
    marginBottom: 15,
  },
  summaryBox: {
    width: "40%",
    padding: 12,
    backgroundColor: "#fff",
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  summaryDivider: {
    borderBottom: "1pt solid #000",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    marginBottom: 8,
    borderBottom: "1pt solid #000",
  },
  summaryLabel: {
    fontSize: 9,
  },
  summaryValue: {
    fontSize: 9,
    textAlign: "right",
  },
  summaryDirection: {
    fontSize: 7,
    color: "#666",
    marginLeft: 4,
  },
  netPayableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 8,
    paddingBottom: 8,
    borderBottom: "1pt solid #000",
  },
  netPayableLeft: {
    flexDirection: "column",
  },
  netPayableRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  netPayableLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  netPayableSubtitle: {
    fontSize: 7,
    color: "#666",
    marginTop: 2,
  },
  netPayableValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  netPayableStatus: {
    fontSize: 7,
    color: "#666",
    marginTop: 2,
  },
  dispatchSection: {
    alignItems: "flex-end",
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
  // Custom Note Section
  noteSection: {
    marginTop: 8,
  },
  noteTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 8,
    color: "#333",
    lineHeight: 1.4,
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

  // Determine if we should use absolute positioning for bottom section
  // Use flow positioning if there are many items to avoid overlap
  const useAbsolutePosition = order.items.length <= 10;
  const bottomSectionStyle = useAbsolutePosition
    ? styles.bottomSection
    : { marginTop: 15 };

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
              Email:{" "}
              <Text style={{ fontWeight: "bold" }}>saqibch51700@gmail.com</Text>
            </Text>
            <Text style={styles.companyDetails}>
              Phone number:{" "}
              <Text style={{ fontWeight: "bold" }}>03167072121</Text>
            </Text>

            <Text style={styles.companyDetails}>
              Mfg. By/Root's Pharma Lahore
            </Text>
            <Text style={styles.companyDetails}>DRAP ENLISTMENT #00553</Text>
          </View>

          {/* Right Logo */}
          {companyLogo && (
            <Image
              src={companyLogo}
              style={{ height: 120, width: 120, objectFit: "contain" }}
            />
          )}
        </View>

        {/* Invoice and Customer Boxes */}
        <View style={styles.topBoxesContainer}>
          {/* Invoice Box */}
          <View style={styles.invoiceBox}>
            <Text style={styles.boxTitle}>INVOICE</Text>

            <View style={styles.boxRow}>
              <Text style={styles.boxLabel}>ID:</Text>
              <Text style={styles.boxValue}>{order.invoiceNumber}</Text>
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

            {order.customerId.phoneNumber && (
              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>Phone:</Text>
                <Text style={styles.boxValue}>
                  {order.customerId.phoneNumber}
                </Text>
              </View>
            )}

            <View style={styles.boxRow}>
              <Text style={styles.boxLabel}>Address:</Text>
              <Text style={styles.boxValue}>
                {(order.customerId as any)?.streetAddress}
                {(order.customerId as any)?.city &&
                  ` ${(order.customerId as any)?.city}`}
                {(order.customerId as any)?.state &&
                  ` ${(order.customerId as any)?.state}`}
              </Text>
            </View>
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
            <Text style={[styles.tableHeaderText, styles.colMfgDate]}>
              MFG Date
            </Text>
            <Text style={[styles.tableHeaderText, styles.colExpDate]}>
              EXP Date
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colRetail]}>
              Retail
            </Text>
            <Text style={[styles.tableHeaderText, styles.colDisc]}>Disc %</Text>
            <Text style={[styles.tableHeaderText, styles.colDiscPrice]}>
              Disc Price
            </Text>
            <Text style={[styles.tableHeaderTextLast, styles.colNetValue]}>
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
                {item.productId.size} {item.productId.packType || "-"}
              </Text>
              <Text style={[styles.tableRowText, styles.colMfgDate]}>
                {(item.productId as any).mfg ? item?.productId?.mfg : "-"}
              </Text>
              <Text style={[styles.tableRowText, styles.colExpDate]}>
                {(item.productId as any).expiry ? item?.productId?.expiry : "-"}
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
              <Text style={[styles.tableRowTextLast, styles.colNetValue]}>
                {formatCurrency(item.lineTotal)}
              </Text>
            </View>
          ))}

          {/* Totals Row */}
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsRowText, styles.colSrNo]}></Text>
            <Text style={[styles.totalsRowText, styles.colItem]}></Text>
            <Text style={[styles.totalsRowText, styles.colBatchNo]}></Text>
            <Text style={[styles.totalsRowText, styles.colPacking]}>
              Totals:
            </Text>
            <Text style={[styles.totalsRowText, styles.colMfgDate]}></Text>
            <Text style={[styles.totalsRowText, styles.colExpDate]}></Text>
            <Text style={[styles.totalsRowText, styles.colQty]}>
              {totalQty}
            </Text>
            <Text style={[styles.totalsRowText, styles.colRetail]}></Text>
            <Text style={[styles.totalsRowText, styles.colDisc]}></Text>
            <Text style={[styles.totalsRowText, styles.colDiscPrice]}></Text>
            <Text style={[styles.totalsRowTextLast, styles.colNetValue]}>
              {formatCurrency(order.grandTotal)}
            </Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={bottomSectionStyle} wrap={false}>
          {/* Top Row - Total Items and Invoice Gross Value */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.totalItems}>
                Total Items: {order.items.length}
              </Text>
              {/* Custom Note */}
            </View>
            <View style={styles.invoiceGrossContainer}>
              <Text style={styles.invoiceGrossLabel}>Invoice Gross Value</Text>
              <Text style={styles.invoiceGrossValue}>
                {formatCurrency(order.subtotal)}
              </Text>
            </View>
          </View>

          {/* Summary Box */}
          <View style={styles.summaryContainer}>
            {customNote ? (
              <View style={styles.noteSection}>
                <Text style={styles.noteTitle}>Warranty:</Text>
                <Text style={styles.noteText}>{customNote}</Text>
              </View>
            ) : (
              <View style={{ width: "40%" }} />
            )}
            <View style={{ width: "40%" }}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Invoice summary</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Current Bill:</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(
                      order.invoiceBalanceSummary.currentOrderBill.amount,
                    )}
                  </Text>
                </View>

                {order.invoiceBalanceSummary && (
                  <View style={styles.summaryRow}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={styles.summaryLabel}>Previous Balance:</Text>
                      <Text style={styles.summaryDirection}>
                        {order.invoiceBalanceSummary.previousBalance
                          .direction === "we_owe_customer"
                          ? "credit"
                          : "debit"}
                      </Text>
                    </View>
                    <Text style={styles.summaryValue}>
                      {order.invoiceBalanceSummary.previousBalance.sign}{" "}
                      {formatCurrency(
                        order.invoiceBalanceSummary.previousBalance.amount,
                      )}
                    </Text>
                  </View>
                )}

                <View style={styles.netPayableRow}>
                  <View style={styles.netPayableLeft}>
                    <Text style={styles.netPayableLabel}>Net Payable:</Text>
                    <Text style={styles.netPayableSubtitle}>
                      Previous balance + current bill
                    </Text>
                  </View>
                  <View style={styles.netPayableRight}>
                    <Text style={styles.netPayableValue}>
                      {order.invoiceBalanceSummary.netPayable.sign}{" "}
                      {formatCurrency(
                        order.invoiceBalanceSummary.netPayable.amount,
                      )}
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
          </View>
        </View>
      </Page>
    </Document>
  );
};

interface GeneratePDFProps {
  order: Order;
}

const defaultNote = `We Do Hereby Give This Warranty That
The Medicines Prepared By Root's Pharma Lhr.
As Sold By Us Are Homeopathic Medicines And
Do Not Contravene in Any Way With Any Provision of The Drap Act 2012`;

export function GeneratePDF({ order }: GeneratePDFProps) {
  const [customNote, setCustomNote] = React.useState(defaultNote);
  const [isClient, setIsClient] = React.useState(false);

  // Logo URLs - Replace these with your actual logo URLs or set to empty string if not available
  const parentCompanyLogo = "/logos/roots-logo.jpeg"; // Parent company logo
  const companyLogo = "/logos/saiban-logo.jpeg"; // Company logo

  // Generate filename with customer name and date
  const generateFileName = () => {
    const day = formatDate(order.createdAt, "dd");
    const month = formatDate(order.createdAt, "MMM").toLowerCase();
    const customerName =
      `${order.customerId.firstName}-${order.customerId.lastName}`.toLowerCase();
    return `${customerName}-${day}-${month}-invoice.pdf`;
  };

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="space-y-4 rounded-lg bg-card max-w-4xl">
      <div className="space-y-2 flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="customNote">Warranty (Optional)</Label>
          <Textarea
            id="customNote"
            placeholder="Enter any additional notes to include in the invoice..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            rows={5}
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
            fileName={generateFileName()}
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
    </div>
  );
}
