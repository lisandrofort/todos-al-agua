const express = require("express");
const contactController = require("../controllers/controllers.contact.js");
const { limitarContacto } = require("../lib/rateLimit.js");

const contactRouter = express.Router();

contactRouter.post("/", limitarContacto, async (req, res, next) => {
  try {
    res.json(await contactController.sendContactMessage(req.body ?? {}));
  } catch (e) {
    next(e);
  }
});

module.exports = contactRouter;
