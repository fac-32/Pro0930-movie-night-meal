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
    movieInfo:
    {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true, // it has the: createdAt, updatedAt
  },
);
whichlistSchema.index({ movieName: 1, userEmail: 1 }, { unique: true }); // prevents adding the same movie twice

const Whishlist = mongoose.model("whishlist", whichlistSchema); //we give singler so Product and mongoose will make it products

export default Whishlist;
