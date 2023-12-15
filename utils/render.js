function render(req, res, view, payload) {
    res.render(view, {...payload, username: req.username, role: req.role})
}

module.exports = render;
