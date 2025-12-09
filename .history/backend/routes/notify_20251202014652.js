const express = require("express");
const router = express.Router();

// Route test duy nhất, không phụ thuộc gì khác
router.get("/test", function(req, res) {
  res.status(200).json({ success: true, message: "Notify router OK" });
});

module.exports = router;
