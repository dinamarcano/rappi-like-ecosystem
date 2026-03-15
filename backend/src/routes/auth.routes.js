const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, storeName } = req.body;

    const userResult = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, email, password, role]
    );

    const user = userResult.rows[0];

    if (role === "store") {
      await pool.query(
        "INSERT INTO stores (name, userId) VALUES ($1,$2)",
        [storeName, user.id]
      );
    }

    res.json(user);

  } catch (error) {
    console.error(error);
    res.status(500).send("Register error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).send("Login error");
  }
});



router.get("/stores", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stores");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting stores");
  }
});


router.get("/products/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;

    const result = await pool.query(
      "SELECT * FROM products WHERE storeId = $1",
      [storeId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting products");
  }
});

router.post("/orders", async (req, res) => {
  try {
    const { consumerId, storeId, items } = req.body;

    // 1. crear la orden
    const orderResult = await pool.query(
      "INSERT INTO orders (consumerId, storeId) VALUES ($1,$2) RETURNING *",
      [consumerId, storeId]
    );

    const order = orderResult.rows[0];

    // 2. insertar productos de la orden
    for (const item of items) {
      await pool.query(
        "INSERT INTO order_items (orderId, productId, quantity) VALUES ($1,$2,$3)",
        [order.id, item.productId, item.quantity]
      );
    }

    res.json(order);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating order");
  }
});



router.get("/orders/available", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE status = 'pending'"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting orders");
  }
});

router.post("/orders/:id/accept", async (req, res) => {

  try {

    const { id } = req.params;
    const { deliveryId } = req.body;

    const result = await pool.query(
      "UPDATE orders SET deliveryid = $1, status = 'accepted' WHERE id = $2 RETURNING *",
      [deliveryId, id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error accepting order");
  }

});



router.get("/orders/my/:deliveryId", async (req, res) => {
  try {

    const { deliveryId } = req.params;

    const result = await pool.query(
      "SELECT * FROM orders WHERE deliveryid = $1",
      [deliveryId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting my orders");
  }
});


router.post("/orders/:id/deliver", async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      "UPDATE orders SET status = 'delivered' WHERE id = $1 RETURNING *",
      [id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error delivering order");
  }
});



router.get("/orders/my/:deliveryId", async (req, res) => {
  try {

    const { deliveryId } = req.params;

    const result = await pool.query(
      "SELECT * FROM orders WHERE deliveryid = $1",
      [deliveryId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting delivery orders");
  }
});

module.exports = router;