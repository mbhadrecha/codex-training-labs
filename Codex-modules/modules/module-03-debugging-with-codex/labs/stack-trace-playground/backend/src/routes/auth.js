function loginUser(req, res) {
  const { email } = req.body || {};

  return res.json({
    ok: true,
    email: email ?? null
  });
}

module.exports = { loginUser };
