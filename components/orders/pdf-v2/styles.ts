import { StyleSheet } from "@react-pdf/renderer";

/**
 * Design tokens for the redesigned (v2) invoice. Centralising colours and
 * spacing keeps the layout consistent and easy to tweak.
 */
export const tokens = {
  ink: "#0f172a", // slate-900 — primary text
  inkSoft: "#334155", // slate-700 — secondary text
  muted: "#64748b", // slate-500 — labels / captions
  faint: "#94a3b8", // slate-400
  line: "#cbd5e1", // slate-300 — borders
  lineSoft: "#e2e8f0", // slate-200 — subtle dividers
  zebra: "#f1f5f9", // slate-100 — alternating rows
  headerBg: "#0f172a", // table header background
  headerText: "#ffffff",
  accent: "#0d9488", // teal-600 — brand accent
  accentSoft: "#f0fdfa", // teal-50
  panel: "#f8fafc", // slate-50 — soft panels
};

export const pdfV2Styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 46,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: tokens.ink,
    lineHeight: 1.35,
  },

  /* ---------------------------------------------------------------- header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: tokens.accent,
  },
  logo: {
    width: 92,
    height: 92,
    objectFit: "contain",
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  companyName: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: tokens.ink,
    marginBottom: 6,
    textAlign: "center",
  },
  companyTrademark: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: tokens.muted,
    letterSpacing: 0.4,
    marginBottom: 7,
    textAlign: "center",
  },
  companyTagline: {
    fontSize: 7.5,
    color: tokens.muted,
    marginBottom: 3,
    textAlign: "center",
  },
  companyTaglineStrong: {
    fontSize: 7.5,
    color: tokens.inkSoft,
    fontFamily: "Helvetica-Bold",
  },

  /* ---------------------------------------------------- invoice title band */
  titleBand: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 10,
  },
  invoiceTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: tokens.ink,
  },
  invoiceTitleAccent: {
    color: tokens.accent,
  },

  /* ------------------------------------------------------------ meta cards */
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  metaCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: tokens.line,
    borderRadius: 6,
    overflow: "hidden",
  },
  metaCardHeader: {
    backgroundColor: tokens.panel,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: tokens.lineSoft,
  },
  metaCardHeaderText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: tokens.accent,
    letterSpacing: 0.6,
  },
  metaCardBody: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  metaLine: {
    flexDirection: "row",
    marginBottom: 2.5,
  },
  metaLabel: {
    width: "32%",
    fontSize: 8,
    color: tokens.muted,
  },
  metaValue: {
    width: "68%",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: tokens.ink,
  },

  /* ----------------------------------------------------------------- table */
  table: {
    borderWidth: 1,
    borderColor: tokens.line,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: tokens.headerBg,
  },
  th: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: tokens.headerText,
    borderRightWidth: 1,
    borderRightColor: "#334155",
  },
  thLast: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: tokens.headerText,
  },
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: tokens.lineSoft,
    alignItems: "stretch",
  },
  rowZebra: {
    backgroundColor: tokens.zebra,
  },
  td: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: tokens.lineSoft,
    justifyContent: "center",
  },
  tdLast: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  cellText: {
    fontSize: 7.5,
    color: tokens.inkSoft,
  },
  cellTextStrong: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: tokens.ink,
  },

  /* totals row inside the table */
  totalsRow: {
    flexDirection: "row",
    backgroundColor: tokens.panel,
    borderTopWidth: 1.5,
    borderTopColor: tokens.line,
  },

  /* column widths (must sum to 100) */
  colSrNo: { width: "4%", textAlign: "center" },
  colItem: { width: "16%", textAlign: "left" },
  colBatchNo: { width: "11%", textAlign: "left" },
  colPacking: { width: "9%", textAlign: "left" },
  colMfgDate: { width: "8%", textAlign: "left" },
  colExpDate: { width: "8%", textAlign: "left" },
  colQty: { width: "5%", textAlign: "right" },
  colRetail: { width: "10%", textAlign: "right" },
  colDisc: { width: "6%", textAlign: "right" },
  colDiscPrice: { width: "11%", textAlign: "right" },
  colNetValue: { width: "12%", textAlign: "right" },

  /* --------------------------------------------------------- bottom region */
  bottomRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  leftColumn: {
    width: "55%",
  },
  rightColumn: {
    width: "45%",
  },

  itemCountPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: tokens.accentSoft,
    borderWidth: 1,
    borderColor: tokens.accent,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  itemCountText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: tokens.accent,
  },

  noteCard: {
    borderWidth: 1,
    borderColor: tokens.lineSoft,
    borderRadius: 6,
    padding: 8,
    backgroundColor: tokens.panel,
  },
  noteTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: tokens.ink,
    marginBottom: 3,
  },
  noteText: {
    fontSize: 7,
    color: tokens.inkSoft,
    lineHeight: 1.45,
  },

  summaryCard: {
    borderWidth: 1,
    borderColor: tokens.line,
    borderRadius: 6,
    overflow: "hidden",
  },
  summaryHeader: {
    backgroundColor: tokens.panel,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: tokens.lineSoft,
  },
  summaryHeaderText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: tokens.ink,
    letterSpacing: 0.4,
  },
  summaryBody: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3.5,
    borderBottomWidth: 1,
    borderBottomColor: tokens.lineSoft,
  },
  summaryLabel: {
    fontSize: 8.5,
    color: tokens.muted,
  },
  summaryValue: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: tokens.inkSoft,
  },
  netPayableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: tokens.ink,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  netPayableLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  netPayableSubtitle: {
    fontSize: 6.5,
    color: tokens.faint,
    marginTop: 1,
  },
  netPayableValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  signatureBlock: {
    marginTop: 18,
    alignItems: "flex-end",
  },
  signatureLine: {
    width: 150,
    borderTopWidth: 1,
    borderTopColor: tokens.inkSoft,
    paddingTop: 3,
  },
  signatureLabel: {
    fontSize: 7.5,
    color: tokens.muted,
    textAlign: "center",
  },

  /* ---------------------------------------------------------------- footer */
  footer: {
    position: "absolute",
    bottom: 18,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: tokens.lineSoft,
    paddingTop: 5,
  },
  footerText: {
    fontSize: 6.5,
    color: tokens.muted,
  },
});
