import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getLocation = async(req, res) => {
  const { model, input } = req.body;
  try {
    const response = await openai.responses.create({
      model: model,
      input: [
        {
          role: "user",
          content: input,
        },
      ],
    });
    res.json({ result: response.output_text });
  } catch (e) {
    res.status(500).json({ error: e.message || "Internal Server Error" });
  }
};