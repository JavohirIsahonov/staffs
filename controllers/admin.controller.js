exports.login = (req, res) => {
    const { username, password } = req.body;
    const adminName = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username === adminName && password === adminPassword) {
        return res.status(200).send({ message: 'Login successful' });
    } else {
        return res.status(401).send({ message: 'Invalid credentials' });
    }
}

