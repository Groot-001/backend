exports.verifyAdmin = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next()
    }
    else {
        return res.status(403).json({ error: "Access denied . Only Admin can access it " })
    }
}