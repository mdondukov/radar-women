// Local development only: the dashboard calls /admin/api/... on its own host,
// as it does in production behind nginx; forward that to a local radar-api.
const {createProxyMiddleware} = require("http-proxy-middleware")

module.exports = function (app) {
    app.use(
        "/admin/api",
        createProxyMiddleware({
            target: "http://localhost:8686",
            changeOrigin: true,
            pathRewrite: {"^/admin/api": "/v1/admin"},
        })
    )
}
