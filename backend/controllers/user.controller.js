export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const searchUsers = async (req, res) => {
  const { name } = req.query;
  try {
    const users = await User.find({ name: new RegExp(name, "i") }).select("-password");
    res.status(200).json({ users });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
