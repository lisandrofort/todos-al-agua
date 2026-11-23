const express = require("express");
const contactController = require("../controllers/controllers.contact.js");

const contactRouter = express.Router();

contactRouter.post("/", async (req, res) => {
  try {
    const ip = req.ip ?? req.socket?.remoteAddress;
    res.json(await contactController.sendContactMessage(req.body ?? {}, ip));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

module.exports = contactRouter;
