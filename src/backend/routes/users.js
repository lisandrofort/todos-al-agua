const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/controllers.users.js");
const { adminOnly, middlewareToken } = require("../middlewares/middleware.user.js");
const {
  limitarLogin,
  limitarRegistro,
  limitarRecuperacion,
  limitarReset,
  limitarExists,
} = require("../lib/rateLimit.js");

userRouter.get("/", middlewareToken, adminOnly, async (req, res, next) => {
  try {
    res.json(await userController.getAllUsers());
  } catch (e) {
    next(e);
  }
});

userRouter.get("/exists", limitarExists, async (req, res, next) => {
  try {
    res.json(await userController.emailExists(req.query.email));
  } catch (e) {
    next(e);
  }
});

userRouter.post("/register", limitarRegistro, async (req, res, next) => {
  try {
    const { name, password, email } = req.body ?? {};
    res.status(201).json(await userController.createUser(name, password, email));
  } catch (e) {
    next(e);
  }
});

userRouter.post("/login", limitarLogin, async (req, res, next) => {
  try {
    const { password, email } = req.body ?? {};
    res.json({ token: await userController.verifyUser(email, password) });
  } catch (e) {
    next(e);
  }
});

userRouter.post("/refresh", middlewareToken, async (req, res, next) => {
  try {
    const token = await userController.refreshSession(req.dataUser);
    if (!token) {
      return res.status(401).json({ error: "Tu sesión no es válida" });
    }
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

userRouter.post(
  "/forgot-password",
  limitarRecuperacion,
  async (req, res, next) => {
    try {
      res.json(await userController.requestPasswordReset(req.body?.email));
    } catch (e) {
      next(e);
    }
  },
);

userRouter.post("/reset-password", limitarReset, async (req, res, next) => {
  try {
    const { token, password } = req.body ?? {};
    res.json(await userController.resetPassword(token, password));
  } catch (e) {
    next(e);
  }
});

userRouter.get("/:id", middlewareToken, adminOnly, async (req, res, next) => {
  try {
    const user = await userController.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (e) {
    next(e);
  }
});

userRouter.put("/:id", middlewareToken, adminOnly, async (req, res, next) => {
  try {
    const user = await userController.updateUserById(req.params.id, req.body ?? {});
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (e) {
    next(e);
  }
});

userRouter.delete("/:id", middlewareToken, adminOnly, async (req, res, next) => {
  try {
    const deleted = await userController.deleteUserById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(deleted);
  } catch (e) {
    next(e);
  }
});

module.exports = userRouter;
