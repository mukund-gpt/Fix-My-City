import { Parser } from "json2csv"; // for CSV
import pdfkit from "pdfkit"; // for PDF
import Complaint from "../models/complaint.model.js";

export const getReports = async (req, res) => {
  try {
    const { startDate, endDate, format } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const complaints = await Complaint.find(filter).lean();

    // Analytics
    const totalComplaints = complaints.length;

    const volumeByCategory = complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});

    const resolvedComplaints = complaints.filter(c => c.status === "resolved");
    const avgResolutionTime =
      resolvedComplaints.reduce((acc, c) => {
        const time = new Date(c.resolvedAt) - new Date(c.createdAt);
        return acc + time;
      }, 0) / resolvedComplaints.length || 0;

    // SLA compliance
    const slaMet = resolvedComplaints.filter(c => c.resolutionTime <= c.slaTime).length;
    const slaCompliance = resolvedComplaints.length ? (slaMet / resolvedComplaints.length) * 100 : 0;

    // Export CSV
    if (format === "csv") {
      const parser = new Parser();
      const csv = parser.parse(complaints);
      res.header("Content-Type", "text/csv");
      res.attachment("complaints.csv");
      return res.send(csv);
    }

    // Export PDF
    if (format === "pdf") {
      const doc = new pdfkit();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=complaints.pdf");
      doc.pipe(res);
      doc.fontSize(18).text("Complaint Reports", { align: "center" });
      doc.moveDown();

      complaints.forEach((c, idx) => {
        doc.fontSize(12).text(`${idx + 1}. ${c.title} | ${c.status} | ${c.category} | ${c.createdAt}`);
      });

      doc.end();
      return;
    }

    // Default: return analytics JSON
    res.json({
      totalComplaints,
      volumeByCategory,
      avgResolutionTime: avgResolutionTime / (1000 * 60 * 60), // in hours
      slaCompliance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
