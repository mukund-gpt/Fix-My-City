export const logoutAdmin = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Admin logout failed" });
      }   
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Admin logout successful" });
    }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAdminDetails = async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ message: "Admin not authenticated" });
    }
    res.status(200).json({ admin: req.session.admin });
  }
  catch (error) {

    res.status(500).json({ message: error.message });
  } 
};
export const verifyAdmin = async (req, res) => {
  const { secretKey } = req.body;
  try {
    if (secretKey === process.env.ADMIN_SECRET_KEY) { 
      req.session.admin = { isAdmin: true };
      res.status(200).json({ message: "Admin verified successfully" });
    } else {
      res.status(403).json({ message: "Invalid secret key" });
    }   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }     
};