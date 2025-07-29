export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const { username, password } = req.body;

  // For now, just return what you sent (test purpose)
  return res.status(200).json({
    message: "Login request received!",
    username,
    password
  });
}
