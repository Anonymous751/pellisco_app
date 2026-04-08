import { Visitor } from "../models/SessionModel.js";


export const trackVisitor = async (req, res, next) => {
  try {
    // We search for the first visitor document. If none exists, we create it.
    let visitor = await Visitor.findOne();

    if (!visitor) {
      await Visitor.create({ count: 1 });
    } else {
      // Increment the count by 1
      visitor.count += 1;
      await visitor.save();
    }
    next(); // Move on to the next function (the actual API route)
  } catch (error) {
    console.error("Visitor Tracking Error:", error);
    next(); // We call next() anyway so the site doesn't crash if tracking fails
  }
};
