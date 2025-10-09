import { Parser } from "json2csv"; // for CSV
import pdfkit from "pdfkit"; // for PDF
import Complaint from "../models/complaint.model.js";

export const getReports = async (req, res) => {
    try {
        const { startDate, endDate, format } = req.query;

        // --- 1. Data Fetching (No changes here) ---
        const filter = {};
        if (startDate && endDate) {
            // Ensure end date includes the entire day
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: new Date(startDate), $lte: endOfDay };
        }

        const complaints = await Complaint.find(filter)
            .populate("citizen", "name email") // Populate user details
          .populate("assignedTo", "name") // Populate assigned staff names
          .populate({
        path: "commentList",                      // Populate comments
        populate: { path: "author", select: "name email" } // Populate comment authors
      })
            .lean();

        // --- 2. Analytics Calculation (No changes here) ---
        const totalComplaints = complaints.length;

        const volumeByCategory = complaints.reduce((acc, c) => {
            acc[c.category] = (acc[c.category] || 0) + 1;
            return acc;
        }, {});

        const resolvedComplaints = complaints.filter(c => c.status === "resolved" && c.resolvedAt);
        const avgResolutionTimeInMillis =
            resolvedComplaints.reduce((acc, c) => {
                const time = new Date(c.resolvedAt) - new Date(c.createdAt);
                return acc + time;
            }, 0) / resolvedComplaints.length || 0;
        
        // Convert average time to a more readable format (days, hours, minutes)
        const avgTimeInHours = avgResolutionTimeInMillis / (1000 * 60 * 60);

        // --- 3. Better CSV Export ---
        if (format === "csv") {
            // Define the columns and their headers for the CSV
            const fields = [
                { label: "ID", value: "_id" },
                { label: "Title", value: "title" },
                { label: "Category", value: "category" },
                { label: "Status", value: "status" },
                { label: "Submitted By", value: "citizen.name" },
                { label: "Submitter Email", value: "citizen.email" },
                { label: "Assigned To", value: "assignedStaff" }, // Custom field
                { label: "Submitted On", value: "createdAt" },
                { label: "Resolved On", value: "resolvedAt" },
            ];

            // Pre-process data to flatten nested objects and format fields
            const processedData = complaints.map(c => ({
                ...c,
                // Combine names of assigned staff into a single string
                assignedStaff: c.assignedTo?.map(staff => staff.name).join(", ") || "N/A",
                // Format dates to be more readable
                createdAt: new Date(c.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                resolvedAt: c.resolvedAt ? new Date(c.resolvedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
            }));

            const parser = new Parser({ fields });
            const csv = parser.parse(processedData);

            res.header("Content-Type", "text/csv");
            res.attachment("complaints-report.csv");
            return res.send(csv);
        }

        // --- 4. Better PDF Export ---
        if (format === "pdf") {
            const doc = new pdfkit({ margin: 50 });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'attachment; filename="complaints-report.pdf"');
            doc.pipe(res);

            // Report Header
            doc.fontSize(20).font("Helvetica-Bold").text("Complaints Report", { align: "center" });
            doc.fontSize(12).font("Helvetica").moveDown(0.5);
            if (startDate && endDate) {
                doc.text(`For the period: ${new Date(startDate).toLocaleDateString("en-IN")} to ${new Date(endDate).toLocaleDateString("en-IN")}`, { align: "center" });
            }
            doc.moveDown(2);

            // Analytics Summary Section
            doc.fontSize(16).font("Helvetica-Bold").text("Analytics Summary", { underline: true });
            doc.moveDown();
            doc.fontSize(12).font("Helvetica");
            doc.text(`Total Complaints: ${totalComplaints}`);
            doc.text(`Resolved Complaints: ${resolvedComplaints.length}`);
            doc.text(`Average Resolution Time: ${avgTimeInHours.toFixed(2)} hours`);
            doc.moveDown();

            doc.font("Helvetica-Bold").text("Volume by Category:");
            doc.font("Helvetica");
            for (const category in volumeByCategory) {
                doc.text(`  - ${category}: ${volumeByCategory[category]}`);
            }
            doc.moveDown(2);

            // Detailed Complaints Table
            doc.fontSize(16).font("Helvetica-Bold").text("Detailed Complaints List", { underline: true });
            doc.moveDown();

            // Table Header
            const tableTop = doc.y;
            const itemX = 50;
            const titleX = 150;
            const categoryX = 300;
            const statusX = 400;
            const dateX = 480;

            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("ID", itemX, tableTop);
            doc.text("Title", titleX, tableTop);
            doc.text("Category", categoryX, tableTop);
            doc.text("Status", statusX, tableTop);
            doc.text("Date", dateX, tableTop, { width: 100, align: 'right' });
            doc.moveTo(itemX - 5, doc.y + 5).lineTo(560, doc.y + 5).stroke(); // Underline
            doc.moveDown();
            
            // Table Rows
            doc.font("Helvetica").fontSize(9);
            complaints.forEach((c) => {
                const rowY = doc.y;
                doc.text(c._id.toString().slice(-6), itemX, rowY, { width: 90 }); // Show last 6 chars of ID
                doc.text(c.title, titleX, rowY, { width: 140 });
                doc.text(c.category, categoryX, rowY, { width: 90 });
                doc.text(c.status, statusX, rowY, { width: 70 });
                doc.text(new Date(c.createdAt).toLocaleDateString("en-IN"), dateX, rowY, { width: 100, align: 'right' });
                
                // Calculate max height for the row and move down
                const maxHeight = Math.max(
                    doc.heightOfString(c.title, { width: 140 }),
                    doc.heightOfString(c._id.toString().slice(-6), { width: 90 })
                );
                doc.y = rowY + maxHeight + 10; // 10 is padding

                // Add page break if content overflows
                if (doc.y > 700) {
                    doc.addPage();
                }
            });

            doc.end();
            return;
        }

        // --- 5. Default JSON Response (No changes here) ---
        res.json({
            totalComplaints,
            volumeByCategory,
            avgResolutionTimeInHours: avgTimeInHours.toFixed(2), // in hours
            resolvedComplaints: resolvedComplaints.length,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};