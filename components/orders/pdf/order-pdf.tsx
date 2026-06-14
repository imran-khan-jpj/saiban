"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  type Styles,
} from "@react-pdf/renderer";
import type { Order } from "@/app/api/orders/use-get-all";
import { formatDate, formatCurrency, parseCurrency } from "@/lib/utils";
import { pdfStyles as styles } from "./styles";
import { breakLongWord } from "./utils";

interface OrderPDFProps {
  order: Order;
  customNote?: string;
  parentCompanyLogo?: string;
  companyLogo?: string;
}

interface PdfTableCellProps {
  columnStyle: Styles[keyof Styles];
  children: string | number;
  isLast?: boolean;
  breakLongWords?: boolean;
  textStyle?: Styles[keyof Styles];
}

function PdfTableCell({
  columnStyle,
  children,
  isLast = false,
  breakLongWords = false,
  textStyle,
}: PdfTableCellProps) {
  const value = String(children);

  return (
    <View
      style={[
        isLast ? styles.tableCellLast : styles.tableCell,
        columnStyle,
      ]}
    >
      <Text
        style={textStyle ? [styles.cellText, textStyle] : styles.cellText}
        hyphenationCallback={
          breakLongWords ? (word) => breakLongWord(word) : undefined
        }
      >
        {value}
      </Text>
    </View>
  );
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
              <PdfTableCell columnStyle={styles.colSrNo} textStyle={{ textAlign: "center" }}>
                {index + 1}
              </PdfTableCell>
              <PdfTableCell columnStyle={styles.colItem} breakLongWords>
                {item.productId.name}
              </PdfTableCell>
              <PdfTableCell columnStyle={styles.colBatchNo} breakLongWords>
                {item.productId.batchNo || "-"}
              </PdfTableCell>
              <PdfTableCell columnStyle={styles.colPacking} breakLongWords>
                {`${item.productId.size} ${item.productId.packType || "-"}`.trim()}
              </PdfTableCell>
              <PdfTableCell columnStyle={styles.colMfgDate}>
                {item.productId.mfg ? item.productId.mfg : "-"}
              </PdfTableCell>
              <PdfTableCell columnStyle={styles.colExpDate}>
                {item.productId.expiry ? item.productId.expiry : "-"}
              </PdfTableCell>
              <PdfTableCell columnStyle={styles.colQty} textStyle={{ textAlign: "right" }}>
                {item.quantity}
              </PdfTableCell>
              <PdfTableCell columnStyle={styles.colRetail} textStyle={{ textAlign: "right" }}>
                {formatCurrency(item.unitPrice)}
              </PdfTableCell>
              <PdfTableCell columnStyle={styles.colDisc} textStyle={{ textAlign: "right" }}>
                {item.discountPercentage}
              </PdfTableCell>
              <PdfTableCell columnStyle={styles.colDiscPrice} textStyle={{ textAlign: "right" }}>
                {formatCurrency(
                  (() => {
                    const unitPrice = parseCurrency(item.unitPrice);
                    return (
                      unitPrice -
                      (unitPrice * item.discountPercentage) / 100
                    );
                  })(),
                )}
              </PdfTableCell>
              <PdfTableCell
                columnStyle={styles.colNetValue}
                textStyle={{ textAlign: "right" }}
                isLast
              >
                {formatCurrency(item.lineTotal)}
              </PdfTableCell>
            </View>
          ))}

          <View style={[styles.totalsRow, { alignItems: "flex-start" }]}>
            <View style={[styles.tableCell, styles.colSrNo]} />
            <View style={[styles.tableCell, styles.colItem]} />
            <View style={[styles.tableCell, styles.colBatchNo]} />
            <View style={[styles.tableCell, styles.colPacking]}>
              <Text style={[styles.cellText, { fontWeight: "bold" }]}>
                Totals:
              </Text>
            </View>
            <View style={[styles.tableCell, styles.colMfgDate]} />
            <View style={[styles.tableCell, styles.colExpDate]} />
            <View style={[styles.tableCell, styles.colQty]}>
              <Text style={[styles.cellText, { textAlign: "right", fontWeight: "bold" }]}>
                {totalQty}
              </Text>
            </View>
            <View style={[styles.tableCell, styles.colRetail]} />
            <View style={[styles.tableCell, styles.colDisc]} />
            <View style={[styles.tableCell, styles.colDiscPrice]} />
            <View style={[styles.tableCellLast, styles.colNetValue]}>
              <Text style={[styles.cellText, { textAlign: "right", fontWeight: "bold" }]}>
                {formatCurrency(order.grandTotal)}
              </Text>
            </View>
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
