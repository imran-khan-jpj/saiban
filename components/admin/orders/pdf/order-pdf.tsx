"use client";

import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import type { Order } from "@/app/api/orders/use-get-all";
import { formatDate, formatCurrency } from "@/lib/utils";
import { pdfStyles as styles } from "./styles";

interface OrderPDFProps {
  order: Order;
  customNote?: string;
  parentCompanyLogo?: string;
  companyLogo?: string;
}

export function OrderPDF({
  order,
  customNote,
  parentCompanyLogo,
  companyLogo,
}: OrderPDFProps) {
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const useAbsolutePosition = order.items.length <= 10;
  const bottomSectionStyle = useAbsolutePosition
    ? styles.bottomSection
    : { marginTop: 15 };

  const customer = order.customerId as Order["customerId"] & {
    streetAddress?: string;
    city?: string;
    state?: string;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer} fixed>
          {parentCompanyLogo && (
            // PDF-only Image from @react-pdf/renderer (not an HTML <img>),
            // so jsx-a11y/alt-text does not apply.
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={parentCompanyLogo} style={styles.logo} />
          )}

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
              Mfg. By/Root&apos;s Pharma Lahore
            </Text>
            <Text style={styles.companyDetails}>DRAP ENLISTMENT #00553</Text>
          </View>

          {companyLogo && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={companyLogo} style={styles.logo} />
          )}
        </View>

        <View style={styles.topBoxesContainer}>
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

          <View style={styles.customerBox}>
            <View style={styles.boxRow}>
              <Text style={styles.boxLabel}>Name:</Text>
              <Text style={styles.boxValue}>
                {customer.firstName} {customer.lastName}
              </Text>
            </View>

            <View style={styles.boxRow}>
              <Text style={styles.boxLabel}>Phone:</Text>
              <Text style={styles.boxValue}>{customer.phoneNumber}</Text>
            </View>

            <View style={styles.boxRow}>
              <Text style={styles.boxLabel}>Address:</Text>
              <Text style={styles.boxValue}>
                {customer.streetAddress}
                {customer.city ? ` ${customer.city}` : ""}
                {customer.state ? ` ${customer.state}` : ""}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
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
                {item.productId.mfg ? item.productId.mfg : "-"}
              </Text>
              <Text style={[styles.tableRowText, styles.colExpDate]}>
                {item.productId.expiry ? item.productId.expiry : "-"}
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

        <View style={bottomSectionStyle} wrap={false}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.totalItems}>
                Total Items: {order.items.length}
              </Text>
            </View>
            <View style={styles.invoiceGrossContainer}>
              <Text style={styles.invoiceGrossLabel}>Invoice Gross Value</Text>
              <Text style={styles.invoiceGrossValue}>
                {formatCurrency(order.subtotal)}
              </Text>
            </View>
          </View>

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
                  <View>
                    <Text style={styles.summaryLabel}>Current Bill:</Text>
                  </View>
                  <View>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(
                        order.invoiceBalanceSummary.currentOrderBill.amount,
                      )}
                    </Text>
                  </View>
                </View>

                {order.invoiceBalanceSummary && (
                  <View style={styles.summaryRow}>
                    <View>
                      <Text style={styles.summaryLabel}>Previous Balance:</Text>
                    </View>
                    <View>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(
                          order.invoiceBalanceSummary.previousBalance.amount,
                        )}
                      </Text>
                    </View>
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
                      {formatCurrency(
                        order.invoiceBalanceSummary.netPayable.amount,
                      )}
                    </Text>
                  </View>
                </View>
              </View>

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
}
