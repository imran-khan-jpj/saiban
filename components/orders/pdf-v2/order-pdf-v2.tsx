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
import { pdfV2Styles as s } from "./styles";

interface OrderPDFV2Props {
  order: Order;
  customNote?: string;
  parentCompanyLogo?: string;
  companyLogo?: string;
}

type ColumnStyle = Styles[keyof Styles];
type CellAlign = "left" | "right" | "center";

interface CellProps {
  column: ColumnStyle;
  children: string | number;
  align?: CellAlign;
  strong?: boolean;
  isLast?: boolean;
  zebra?: boolean;
}

/**
 * A single table cell. Long unbroken values (e.g. batch numbers) wrap onto the
 * next line of the same cell thanks to the global hyphenation callback
 * registered in `hyphenation.ts` — there is no manual string slicing here.
 */
function Cell({
  column,
  children,
  align = "left",
  strong = false,
  isLast = false,
  zebra = false,
}: CellProps) {
  return (
    <View
      style={[
        isLast ? s.tdLast : s.td,
        column,
        zebra ? s.rowZebra : {},
      ]}
    >
      <Text style={[strong ? s.cellTextStrong : s.cellText, { textAlign: align }]}>
        {String(children)}
      </Text>
    </View>
  );
}

function discountedUnitPrice(unitPrice: Order["items"][number]["unitPrice"], discountPercentage: number): number {
  const price = parseCurrency(unitPrice);
  return price - (price * discountPercentage) / 100;
}

export function OrderPDFV2({
  order,
  customNote,
  parentCompanyLogo,
  companyLogo,
}: OrderPDFV2Props) {
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const customer = order.customerId as Order["customerId"] & {
    streetAddress?: string;
    city?: string;
    state?: string;
  };

  const addressParts = [
    customer.streetAddress,
    customer.city,
    customer.state,
  ].filter(Boolean);
  const address = addressParts.join(", ");

  const balance = order.invoiceBalanceSummary;

  return (
    <Document
      title={`Invoice ${order.invoiceNumber ?? order._id}`}
      author="Saiban Homoeopathic Pharma"
    >
      <Page size="A4" style={s.page}>
        {/* ----------------------------------------------------- header */}
        <View style={s.header} fixed>
          {parentCompanyLogo && (
            // PDF-only Image from @react-pdf/renderer (not an HTML <img>).
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={parentCompanyLogo} style={s.logo} />
          )}

          <View style={s.headerCenter}>
            <Text style={s.companyName}>Saiban Homoeopathic Pharma</Text>
            <Text style={s.companyTagline}>
              Mfg. By Root&apos;s Pharma, Lahore · DRAP Enlistment #00553
            </Text>
            <Text style={s.companyTagline}>
              Email: <Text style={s.companyTaglineStrong}>saqibch51700@gmail.com</Text>
              {"   "}Phone: <Text style={s.companyTaglineStrong}>0316 7072121</Text>
            </Text>
          </View>

          {companyLogo && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={companyLogo} style={s.logo} />
          )}
        </View>

        {/* ----------------------------------------------- invoice title */}
        <View style={s.titleBand}>
          <Text style={s.invoiceTitle}>
            <Text style={s.invoiceTitleAccent}>SALES </Text>INVOICE
          </Text>
        </View>

        {/* ------------------------------------------------- meta cards */}
        <View style={s.metaRow}>
          <View style={s.metaCard}>
            <View style={s.metaCardHeader}>
              <Text style={s.metaCardHeaderText}>INVOICE DETAILS</Text>
            </View>
            <View style={s.metaCardBody}>
              <View style={s.metaLine}>
                <Text style={s.metaLabel}>Invoice No</Text>
                <Text style={s.metaValue}>{order.invoiceNumber || "-"}</Text>
              </View>
              <View style={s.metaLine}>
                <Text style={s.metaLabel}>Date</Text>
                <Text style={s.metaValue}>{formatDate(order.createdAt)}</Text>
              </View>
              <View style={s.metaLine}>
                <Text style={s.metaLabel}>Payment</Text>
                <Text style={s.metaValue}>{order.paymentMethod || "-"}</Text>
              </View>
            </View>
          </View>

          <View style={s.metaCard}>
            <View style={s.metaCardHeader}>
              <Text style={s.metaCardHeaderText}>BILL TO</Text>
            </View>
            <View style={s.metaCardBody}>
              <View style={s.metaLine}>
                <Text style={s.metaLabel}>Name</Text>
                <Text style={s.metaValue}>
                  {`${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() || "-"}
                </Text>
              </View>
              <View style={s.metaLine}>
                <Text style={s.metaLabel}>Phone</Text>
                <Text style={s.metaValue}>{customer.phoneNumber || "-"}</Text>
              </View>
              <View style={s.metaLine}>
                <Text style={s.metaLabel}>Address</Text>
                <Text style={s.metaValue}>{address || "-"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ------------------------------------------------------ table */}
        <View style={s.table}>
          {/* Header repeats automatically on every page via `fixed`. */}
          <View style={s.tableHeader} fixed>
            <Text style={[s.th, s.colSrNo, { textAlign: "center" }]}>#</Text>
            <Text style={[s.th, s.colItem]}>Item</Text>
            <Text style={[s.th, s.colBatchNo]}>Batch No</Text>
            <Text style={[s.th, s.colPacking]}>Packing</Text>
            <Text style={[s.th, s.colMfgDate]}>MFG</Text>
            <Text style={[s.th, s.colExpDate]}>EXP</Text>
            <Text style={[s.th, s.colQty, { textAlign: "right" }]}>Qty</Text>
            <Text style={[s.th, s.colRetail, { textAlign: "right" }]}>Retail</Text>
            <Text style={[s.th, s.colDisc, { textAlign: "right" }]}>Disc%</Text>
            <Text style={[s.th, s.colDiscPrice, { textAlign: "right" }]}>Disc Price</Text>
            <Text style={[s.thLast, s.colNetValue, { textAlign: "right" }]}>Net Value</Text>
          </View>

          {order.items.map((item, index) => {
            const zebra = index % 2 === 1;
            const packing = `${item.productId.size ?? ""} ${item.productId.packType ?? ""}`.trim();
            return (
              <View key={index} style={[s.row, zebra ? s.rowZebra : {}]} wrap={false}>
                <Cell column={s.colSrNo} align="center" zebra={zebra}>
                  {index + 1}
                </Cell>
                <Cell column={s.colItem} strong zebra={zebra}>
                  {item.productId.name}
                </Cell>
                <Cell column={s.colBatchNo} zebra={zebra}>
                  {item.productId.batchNo || "-"}
                </Cell>
                <Cell column={s.colPacking} zebra={zebra}>
                  {packing || "-"}
                </Cell>
                <Cell column={s.colMfgDate} zebra={zebra}>
                  {item.productId.mfg || "-"}
                </Cell>
                <Cell column={s.colExpDate} zebra={zebra}>
                  {item.productId.expiry || "-"}
                </Cell>
                <Cell column={s.colQty} align="right" zebra={zebra}>
                  {item.quantity}
                </Cell>
                <Cell column={s.colRetail} align="right" zebra={zebra}>
                  {formatCurrency(item.unitPrice)}
                </Cell>
                <Cell column={s.colDisc} align="right" zebra={zebra}>
                  {`${item.discountPercentage}%`}
                </Cell>
                <Cell column={s.colDiscPrice} align="right" zebra={zebra}>
                  {formatCurrency(
                    discountedUnitPrice(item.unitPrice, item.discountPercentage),
                  )}
                </Cell>
                <Cell column={s.colNetValue} align="right" strong isLast zebra={zebra}>
                  {formatCurrency(item.lineTotal)}
                </Cell>
              </View>
            );
          })}

          {/* totals row */}
          <View style={s.totalsRow} wrap={false}>
            <View style={[s.td, s.colSrNo]} />
            <View style={[s.td, s.colItem]}>
              <Text style={s.cellTextStrong}>Totals</Text>
            </View>
            <View style={[s.td, s.colBatchNo]} />
            <View style={[s.td, s.colPacking]} />
            <View style={[s.td, s.colMfgDate]} />
            <View style={[s.td, s.colExpDate]} />
            <View style={[s.td, s.colQty]}>
              <Text style={[s.cellTextStrong, { textAlign: "right" }]}>{totalQty}</Text>
            </View>
            <View style={[s.td, s.colRetail]} />
            <View style={[s.td, s.colDisc]} />
            <View style={[s.td, s.colDiscPrice]} />
            <View style={[s.tdLast, s.colNetValue]}>
              <Text style={[s.cellTextStrong, { textAlign: "right" }]}>
                {formatCurrency(order.grandTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* --------------------------------------------- bottom region */}
        <View style={s.bottomRow} wrap={false}>
          <View style={s.leftColumn}>
            <View style={s.itemCountPill}>
              <Text style={s.itemCountText}>
                Total Items: {order.items.length}  ·  Total Qty: {totalQty}
              </Text>
            </View>

            {customNote ? (
              <View style={s.noteCard}>
                <Text style={s.noteTitle}>Warranty</Text>
                <Text style={s.noteText}>{customNote}</Text>
              </View>
            ) : null}
          </View>

          <View style={s.rightColumn}>
            <View style={s.summaryCard}>
              <View style={s.summaryHeader}>
                <Text style={s.summaryHeaderText}>Invoice Summary</Text>
              </View>
              <View style={s.summaryBody}>
                <View style={s.summaryLine}>
                  <Text style={s.summaryLabel}>Current Bill</Text>
                  <Text style={s.summaryValue}>
                    {formatCurrency(balance.currentOrderBill.amount)}
                  </Text>
                </View>
                <View style={s.summaryLine}>
                  <Text style={s.summaryLabel}>Previous Balance</Text>
                  <Text style={s.summaryValue}>
                    {formatCurrency(balance.previousBalance.amount)}
                  </Text>
                </View>
              </View>
              <View style={s.netPayableRow}>
                <View>
                  <Text style={s.netPayableLabel}>Net Payable</Text>
                  <Text style={s.netPayableSubtitle}>
                    Previous balance + current bill
                  </Text>
                </View>
                <Text style={s.netPayableValue}>
                  {formatCurrency(balance.netPayable.amount)}
                </Text>
              </View>
            </View>

            <View style={s.signatureBlock}>
              <View style={s.signatureLine}>
                <Text style={s.signatureLabel}>Dispatch Officer</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ----------------------------------------------------- footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Saiban Homoeopathic Pharma · Computer-generated invoice
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
