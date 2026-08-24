import { Parser } from "json2csv"; // for CSV
import pdfkit from "pdfkit"; // for PDF
import Complaint from "../models/complaint.model.js";

// Define the SLA in milliseconds (e.g., 48 hours)
const SLA_HOURS = 48;
const SLA_MILLIS = SLA_HOURS * 60 * 60 * 1000;
 const departmentCategories = [
  "Electricity",
  "Sanitation",
  "Animal Welfare",
  "Waste Management",
  "Agriculture",
  "Road & Transport",
  "Environment",
  "Parks & Gardens",
  "Housing",
  "Disaster Management"
];

export const getReports = async (req, res) => {
    try {
        const { startDate, endDate, format } = req.query;

        // --- 1. Data Fetching ---
        const filter = {};
        if (startDate && endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: new Date(startDate), $lte: endOfDay };
        }

        const complaints = await Complaint.find(filter)
            .populate("citizen", "name email")
            .populate("assignedTo", "name department")
            .populate({
                path: "commentList",
                populate: { path: "author", select: "name email" }
            })
            .lean();

        // --- 2. Analytics Calculation (UPDATED) ---
        const totalComplaints = complaints.length;
        const resolvedComplaints = complaints.filter(c => c.status === "RESOLVED" && c.resolvedAt);

        const categoryCounts = await Complaint.aggregate([
            {
                $lookup: {
                from: "users", // matches User collection
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedStaff",
                },
            },
            {
                $unwind: {
                path: "$assignedStaff",
                preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                _id: { $ifNull: ["$assignedStaff.department", "Unassigned"] },
                count: { $sum: 1 },
                },
            },
            ]);

            // Convert the array into an object like { "Electrical": 5, "Plumbing": 3 }
            const volumeByCategory = categoryCounts.reduce((acc, curr) => {
            acc[curr._id || "Uncategorized"] = curr.count;
            return acc;
            }, {});
            

        const filteredVolumeByCategory = Object.fromEntries(
        Object.entries(volumeByCategory).filter(([category]) =>
            departmentCategories.includes(category)
        )
        );

        // --- Average Resolution Time Calculation ---
        const totalResolutionTimeInMillis = resolvedComplaints.reduce((acc, c) => {
            const time = new Date(c.resolvedAt) - new Date(c.createdAt);
            return acc + time;
        }, 0);
        
        const avgResolutionTimeInMillis = totalResolutionTimeInMillis / resolvedComplaints.length || 0;
        const avgResolutionTimeInHours = avgResolutionTimeInMillis / (1000 * 60 * 60);

        // --- SLA Compliance Calculation (NEW) ---
        const slaCompliantCount = resolvedComplaints.filter(c => {
            const timeTaken = new Date(c.resolvedAt) - new Date(c.createdAt);
            return timeTaken <= SLA_MILLIS;
        }).length;

        const slaCompliance = totalComplaints > 0 
            ? (slaCompliantCount / resolvedComplaints.length) * 100 || 0 // % of RESOLVED complaints that met SLA
            : 0;
        
        // --- If you want % of TOTAL complaints that met SLA, use:
        // const slaCompliance = totalComplaints > 0 ? (slaCompliantCount / totalComplaints) * 100 : 0;
        // I'll stick with the first definition (% of resolved complaints) as it's more standard for SLA.
        // If there are no resolved complaints, it defaults to 0.

        // --- 3. Better CSV Export (No change needed) ---
        if (format === "csv") {
            const fields = [
                { label: "ID", value: "_id" },
                { label: "Title", value: "title" },
                { label: "Department", value: "department" },
                { label: "Status", value: "status" },
                { label: "Submitted By", value: "citizen.name" },
                { label: "Submitter Email", value: "citizen.email" },
                { label: "Assigned To", value: "assignedStaff" },
                { label: "Submitted On", value: "createdAt" },
                { label: "Resolved On", value: "resolvedAt" },
            ];

            const processedData = complaints.map(c => ({
                ...c,
                assignedStaff: c.assignedTo?.map(staff => staff.name).join(", ") || "N/A",
                department: c.assignedTo?.map(staff => staff.department).filter(Boolean).join(", ") || "Unassigned",
                createdAt: new Date(c.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                resolvedAt: c.resolvedAt ? new Date(c.resolvedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
                comments: c.commentList?.map(
                    com => `${com.author?.name}: ${com?.commentText}${com?.imageUrl?.length ? " [Image attached]" : ""}`
                ).join(" | ") || "No comments",
            }));

            const parser = new Parser({ fields });
            const csv = parser.parse(processedData);

            res.header("Content-Type", "text/csv");
            res.attachment("complaints-report.csv");
            return res.send(csv);
        }

        // --- 4. Better PDF Export (Updated to include SLA) ---
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
            doc.text(`Average Resolution Time: ${avgResolutionTimeInHours.toFixed(2)} hours`);
            doc.text(`SLA Compliance (Target ${SLA_HOURS}h): ${slaCompliance.toFixed(1)}%`);
            doc.moveDown();

            doc.font("Helvetica-Bold").text("Volume by Category:");
            doc.font("Helvetica");
            for (const category in volumeByCategory) {
                doc.text(`  - ${category}: ${volumeByCategory[category]}`);
            }
            doc.moveDown(2);

            // Detailed Complaints Table (PDF content below is fine)
            // ... (rest of the PDF generation code)

            doc.fontSize(16).font("Helvetica-Bold").text("Detailed Complaints List", { underline: true });
            doc.moveDown();

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
            doc.moveTo(itemX - 5, doc.y + 5).lineTo(560, doc.y + 5).stroke();
            doc.moveDown();
            
            doc.font("Helvetica").fontSize(9);
            complaints.forEach((c) => {
                const rowY = doc.y;
                doc.text(c._id.toString().slice(-6), itemX, rowY, { width: 90 });
                doc.text(c.title, titleX, rowY, { width: 140 });
                doc.text(c.assignedTo?.map(staff => staff.department).filter(Boolean).join(", ") || "Unassigned", categoryX, rowY, { width: 90 });
                doc.text(c.status, statusX, rowY, { width: 70 });
                doc.text(new Date(c.createdAt).toLocaleDateString("en-IN"), dateX, rowY, { width: 100, align: 'right' });
                
                const maxHeight = Math.max(
                    doc.heightOfString(c.title, { width: 140 }),
                    doc.heightOfString(c._id.toString().slice(-6), { width: 90 })
                );
                doc.y = rowY + maxHeight + 10;

                if (doc.y > 700) {
                    doc.addPage();
                }
            });

            doc.end();
            return;
        }

        // --- 5. Default JSON Response (UPDATED to match frontend keys) ---
        res.json({
            totalComplaints,
            filteredVolumeByCategory,
            avgResolutionTimeInHours: avgResolutionTimeInHours.toFixed(2),
            slaCompliance: slaCompliance.toFixed(1),
            resolvedComplaints: resolvedComplaints.length,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};