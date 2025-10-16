import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  "693400949255-0375vn82b9l3j9dqvlkp9se04a2sc5tj.apps.googleusercontent.com",
);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:
      "693400949255-0375vn82b9l3j9dqvlkp9se04a2sc5tj.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  return payload; // Contains user info: email, name, picture, sub (unique ID)
}

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await verifyGoogleToken(token);
    res.json({ success: true, user: payload });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
