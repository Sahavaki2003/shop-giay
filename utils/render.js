function render(req, res, view, payload) {
  res.render(view, {
    ...payload,
    username: req.username,
    role: req.role,
    id: req.id,
  });
}

module.exports = render;
