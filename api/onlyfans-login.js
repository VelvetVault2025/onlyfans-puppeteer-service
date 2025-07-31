export default function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;
    res.status(200).json({
      message: "Login request received!",
      username,
      password
    });
  } else {
    res.status(405).json({ error: "Only POST requests are allowed" });
  }
}
