import PDFDocument from "pdfkit";

// Helper — format currency without ₹ symbol (Helvetica can't render it)
const inr = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;

export const generateBillPDF = (billData, res) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${billData.admissionId}.pdf`,
  );

  doc.pipe(res);

  // ── Header ──────────────────────────────────────────────────────────────────
  doc
    .fillColor("#042954")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("INVOICE", { align: "center" });

  doc.moveDown(0.5);
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor("#fabf22")
    .lineWidth(2)
    .stroke();
  doc.moveDown(0.8);

  // ── Patient info ─────────────────────────────────────────────────────────────
  doc
    .fillColor("#042954")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Patient Name:", { continued: true })
    .font("Helvetica")
    .fillColor("#333")
    .text(`  ${billData.patientName}`);

  doc
    .fillColor("#042954")
    .font("Helvetica-Bold")
    .text("Admission ID:", { continued: true })
    .font("Helvetica")
    .fillColor("#333")
    .text(`  ${billData.admissionId}`);

  doc
    .fillColor("#042954")
    .font("Helvetica-Bold")
    .text("Date:", { continued: true })
    .font("Helvetica")
    .fillColor("#333")
    .text(
      `  ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
    );

  doc.moveDown(1);
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor("#e0e0e0")
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.4);

  // ── Table header ─────────────────────────────────────────────────────────────
  doc.fillColor("#042954").font("Helvetica-Bold").fontSize(10);
  const tableTop = doc.y;
  doc.text("Service", 50, tableTop);
  doc.text("Rate", 300, tableTop, { width: 80, align: "right" });
  doc.text("Qty", 390, tableTop, { width: 60, align: "center" });
  doc.text("Total", 455, tableTop, { width: 90, align: "right" });

  doc.moveDown(0.3);
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor("#e0e0e0")
    .lineWidth(0.5)
    .stroke();

  // ── Table rows ───────────────────────────────────────────────────────────────
  billData.services.forEach((s) => {
    doc.moveDown(0.5);
    const rowY = doc.y;

    doc
      .fillColor("#333")
      .font("Helvetica")
      .fontSize(10)
      .text(s.serviceName, 50, rowY, { width: 240 });

    // ✅ Use inr() helper — no ₹ symbol
    doc.text(inr(s.rate), 300, rowY, { width: 80, align: "right" });
    doc.text(String(s.qty), 390, rowY, { width: 60, align: "center" });
    doc.text(inr(s.total), 455, rowY, { width: 90, align: "right" });

    doc.moveDown(0.2);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#f0f0f0")
      .lineWidth(0.5)
      .stroke();
  });

  doc.moveDown(1);

  // ── Summary ──────────────────────────────────────────────────────────────────
  const summaryLabelX = 340;
  const summaryValueX = 455;
  const summaryValueW = 90;

  const summaryRow = (label, value, bold = false, color = "#555") => {
    doc.moveDown(0.45);
    const y = doc.y;
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(bold ? 11 : 10)
      .fillColor("#666")
      .text(label, summaryLabelX, y, { width: 110 });
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fillColor(color)
      // ✅ inr() for all money values — no ₹ anywhere
      .text(inr(value), summaryValueX, y, {
        width: summaryValueW,
        align: "right",
      });
  };

  summaryRow("Subtotal", billData.summary.subTotal, false, "#333");
  summaryRow("Tax", billData.summary.taxAmount, false, "#d46b08");
  summaryRow("Discount", billData.summary.discountAmount, false, "#389e0d");

  doc.moveDown(0.5);
  doc
    .moveTo(summaryLabelX, doc.y)
    .lineTo(summaryLabelX + 205, doc.y)
    .strokeColor("#042954")
    .lineWidth(1)
    .stroke();

  summaryRow("Grand Total", billData.summary.finalAmount, true, "#042954");

  // ── Footer ───────────────────────────────────────────────────────────────────
  doc.moveDown(3);
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor("#fabf22")
    .lineWidth(1.5)
    .stroke();
  doc.moveDown(0.5);
  doc
    .fontSize(9)
    .fillColor("#aaa")
    .font("Helvetica")
    .text("Thank you for choosing our services.", { align: "center" });

  doc.end();
};
