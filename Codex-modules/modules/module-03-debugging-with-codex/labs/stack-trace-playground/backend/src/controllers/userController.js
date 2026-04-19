function getUserSummary(req, res) {
  return res.json({
    status: "ok",
    userId: req.params?.id ?? null
  });
}

module.exports = { getUserSummary };
