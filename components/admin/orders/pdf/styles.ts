import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1pt solid #000",
    marginBottom: 2,
    padding: 0,
  },
  logo: {
    width: 120,
    height: 90,
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
    marginBottom: 1,
  },
  companyDetails: {
    fontSize: 7,
    marginBottom: 0.5,
  },
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
  colSrNo: { width: "4%", textAlign: "center" },
  colItem: { width: "15%", textAlign: "left" },
  colBatchNo: { width: "8%", textAlign: "left" },
  colPacking: { width: "8%", textAlign: "left" },
  colMfgDate: { width: "8%", textAlign: "left" },
  colExpDate: { width: "8%", textAlign: "left" },
  colQty: { width: "6%", textAlign: "right" },
  colRetail: { width: "10%", textAlign: "right" },
  colDisc: { width: "6%", textAlign: "right" },
  colDiscPrice: { width: "10%", textAlign: "right" },
  colNetValue: { width: "17%", textAlign: "right" },
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
    borderBottom: "1pt solid #ddd",
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
    marginTop: 2,
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
  noteSection: {
    width: "62%",
    marginTop: 8,
    padding: 8,
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
