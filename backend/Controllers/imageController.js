import fetch from "node-fetch";

export const getImage = async (req, res) => {
  const { params } = req.body;
  const url = `https://api.unsplash.com/search/photos?${params}`;
  try {
    const result = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`,
      },
    });
    const output = await result.json();
    res.json(output);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch image" });
  }
};
