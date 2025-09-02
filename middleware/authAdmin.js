

const authAdmin = (req, res, next) => {
    const { username, password } = req.headers;

    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {
        next(); // ✅ Admin ruxsat
    } else {
        return res.status(403).json({ success: false, message: "Access denied" });
    }
};

module.exports = authAdmin;
