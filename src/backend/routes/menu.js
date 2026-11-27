const express = require("express");
const menuRouter = express.Router();
const menuController = require("../controllers/controllers.menu.js");
const { adminOnly, middlewareToken } = require("../middlewares/middleware.user.js");

menuRouter.get("/", async (req, res, next) => {
  try {
    res.json(await menuController.getFullMenu());
  } catch (e) {
    next(e);
  }
});

menuRouter.get("/category/:category", async (req, res, next) => {
  try {
    res.json(await menuController.getDishByCategory(req.params.category));
  } catch (e) {
    next(e);
  }
});

menuRouter.get("/:id", async (req, res, next) => {
  try {
    const dish = await menuController.getDishById(req.params.id);
    if (!dish) {
      return res.status(404).json({ error: "Plato no encontrado" });
    }
    res.json(dish);
  } catch (e) {
    next(e);
  }
});

menuRouter.post("/", middlewareToken, adminOnly, async (req, res, next) => {
  try {
    res.status(201).json(await menuController.createCategory(req.body ?? {}));
  } catch (e) {
    next(e);
  }
});

menuRouter.put("/:id", middlewareToken, adminOnly, async (req, res, next) => {
  try {
    const category = await menuController.updateCategory(req.params.id, req.body ?? {});
    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json(category);
  } catch (e) {
    next(e);
  }
});

menuRouter.delete("/:id", middlewareToken, adminOnly, async (req, res, next) => {
  try {
    const deleted = await menuController.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json(deleted);
  } catch (e) {
    next(e);
  }
});

menuRouter.post("/:id/items", middlewareToken, adminOnly, async (req, res, next) => {
  try {
    const item = await menuController.addItem(req.params.id, req.body ?? {});
    if (!item) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

menuRouter.put(
  "/:id/items/:itemId",
  middlewareToken,
  adminOnly,
  async (req, res, next) => {
    try {
      const item = await menuController.updateItem(
        req.params.id,
        req.params.itemId,
        req.body ?? {},
      );
      if (!item) {
        return res.status(404).json({ error: "Categoría o plato no encontrado" });
      }
      res.json(item);
    } catch (e) {
      next(e);
    }
  },
);

menuRouter.delete(
  "/:id/items/:itemId",
  middlewareToken,
  adminOnly,
  async (req, res, next) => {
    try {
      const deleted = await menuController.deleteItem(
        req.params.id,
        req.params.itemId,
      );
      if (!deleted) {
        return res.status(404).json({ error: "Categoría o plato no encontrado" });
      }
      res.json(deleted);
    } catch (e) {
      next(e);
    }
  },
);

module.exports = menuRouter;
