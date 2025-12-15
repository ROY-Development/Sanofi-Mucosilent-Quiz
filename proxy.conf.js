const PROXY_CONFIG = [
	{
		context: [
			"/uploads",
			"/api",
		],
		target: "http://localhost/r-o-y/Sanofi-Mucosilent-Quiz/backend",
		secure: false,
		changeOrigin: true,
		logLevel: "debug"
	}
]

module.exports = PROXY_CONFIG;