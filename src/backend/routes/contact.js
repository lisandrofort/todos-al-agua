const express = require("express");
const contactController = require("../controllers/controllers.contact.js");

const contactRouter = express.Router();
const { limitarContacto } = require("../lib/rateLimit.js");

contactRouter.post("/", limitarContacto, async (req, res) => {
  try {
    res.json(await contactController.sendContactMessage(req.body ?? {}));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

module.exports = contactRouter;
