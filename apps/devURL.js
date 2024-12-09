function displayURL(req, res) {
  res.json({ url: process.env.DEV_URL })
}

export default displayURL