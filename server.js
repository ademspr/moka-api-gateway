import express from 'express';
import routesConfig from "./routes.json"

const port = 5000;

var routes = {};
routesConfig.forEach(route => routes[route.path] = route.redirect);
console.log(JSON.stringify(routes));

const app = express();


app.all('*', (req, res) => handlerReq(req, res));

const handlerReq = (req, res) => {
	const routeConfig = routesConfig.filter(route => {
		const regexp = new RegExp(route.path);
		const r = regexp.exec(req.path);
		if (r) {
			return route;
		}
	})[0];
	if (routeConfig) {
		const redirectUrl = routeConfig.redirect;
		const replace = routeConfig.replace;

		console.log(`[${req.method}] route ${req.path} redirect to ${redirectUrl}`);

		const redirectPath = req.path.replace(replace, "").replace("//", "");

		res.redirect(`${redirectUrl}${redirectPath}`);
	} else {
		console.log(`route ${req.path} dont't match.`);
		res.status(404).send("not found");
	}
};

app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`);
});