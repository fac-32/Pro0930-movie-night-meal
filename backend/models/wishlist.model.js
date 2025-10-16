import mongoose from "mongoose";

const whichlistSchema = new mongoose.Schema(
  {
    movieName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // it has the: createdAt, updatedAt
  },
);

const Whishlist = mongoose.model("whishlist", whichlistSchema); //we give singler so Product and mongoose will make it products

export default Whishlist;
