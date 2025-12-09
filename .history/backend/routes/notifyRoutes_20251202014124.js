

const express = require("express");
const router = express.Router();

// Route test đơn giản để xác nhận router hoạt động
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Notify router OK" });
});

module.exports = router;
