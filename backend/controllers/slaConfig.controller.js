import SLAConfig from "../models/slaConfig.model.js";

// GET /api/slaconfig
export const getSLAConfig = async (req, res) => {
  try {
    // console.log('sending sla config');
    
    let config = await SLAConfig.findOne({});
    if (!config) {
      // If no config exists, create a default one
      config = await SLAConfig.create({
        HIGH: { TTA: 2, TTR: 24 },
        MEDIUM: { TTA: 4, TTR: 72 },
        LOW: { TTA: 8, TTR: 168 },
      });
    }
    res.json(config);
  } catch (error) {
    console.error("Error fetching SLA config:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/slaconfig
// Controller
export const saveSLAConfig = async (req, res) => {
  try {
    const { newConfig } = req.body;

    // Only keep HIGH, MEDIUM, LOW — discard _id, createdAt, updatedAt
    const slaData = {
      HIGH: newConfig.HIGH,
      MEDIUM: newConfig.MEDIUM,
      LOW: newConfig.LOW
    };

    const saved = await SLAConfig.findOneAndUpdate(
      {}, // or filter if multiple docs exist
      slaData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: saved });

  } catch (err) {
    console.error("Error saving SLA config:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};
