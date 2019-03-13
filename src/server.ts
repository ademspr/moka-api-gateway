import express, { Application, Request, Response } from "express";
import fs from "fs";
import axios from "axios";
import https from "https";
import http from "http";
import cors from "cors";
import queryString from 'query-string';


export interface RouteConfig {
	basePath: string,
	match: string,
	replace: string,
	redirect: string,
	swagger: string
}

const data = fs.readFileSync("routes.json");
const routesConfig: RouteConfig[] = JSON.parse(data.toString());

export default class Server {
	private port: number;
	private app: Application;
	private routesConfig: RouteConfig[];

	constructor(port: number) {
		this.port = port;
		this.app = express();
		this.routesConfig = routesConfig;
	}

	start() {
		console.log(this.routesConfig.map(r => r.basePath));
		this.app.all("*", cors(), (req, res) => this._handlerReq(req, res));
		this.app.use((req, res, next) => {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
			next();
		});

		const httpServer = http.createServer(this.app);

		httpServer.listen(this.port, () => {
			console.log(`Moka gatway listening http on port ${this.port}!`);
		});

		const httpsServer = https.createServer({
			key: fs.readFileSync("server.key"),
			cert: fs.readFileSync("server.cert")
		}, this.app);

		httpsServer.listen(5030, () => {
			console.log(`Moka gatway listening https on port ${5030}!`);
		});

	}

	private _handlerReq = (req: Request, res: Response) => {
		if (req.path === "/swagger/docs") return this._resolveSwagger(req, res);
		const routeConfig = this.routesConfig.filter(route => {
			const regexp = new RegExp(route.match);
			const r = regexp.exec(req.path);
			if (r) {
				return true;
			}
		})[0];
		if (routeConfig) {
			const redirectUrl = routeConfig.redirect;
			const replace = routeConfig.replace;

			const redirectPath = req.path.replace(replace, "").replace("//", "");

			console.log(`[${req.method}] route ${req.path} redirect to ${redirectUrl}`);
			res.redirect(307, `${redirectUrl}${redirectPath}?${queryString.stringify(req.query)}`);


		} else {
			console.log(`route ${req.path} dont"t match.`);
			res.status(404).send("not found");
		}
	};

	private _resolveSwagger = (req: Request, res: Response) => {
		const routes = this.routesConfig.filter(route => route.swagger !== "");

		const agent = new https.Agent({
			rejectUnauthorized: false
		});
		const swaggerPromises = routes.map(route => axios.get(route.swagger, { httpsAgent: agent }).then(r => r.data));

		const schemes = [req.protocol];

		Promise.all(swaggerPromises).then(values => {
			const ret = values.reduce((a, i) => {
				if (!a) {
					a = Object.assign({}, i);
					a.paths = {};
					a.definitions = {};
				}
				for (var key in i.paths) {
					let path = key;
					let alias = "";

					if (i.basePath) {
						path = i.basePath.replace("/", "") + key;
						alias = i.basePath.replace("/", "");
					}

					this.resolveRefs(i.paths[key], alias);
					a.paths[path] = i.paths[key];
				}
				for (var k in i.definitions) {
					let definitionPath = k;
					let alias = "";
					if (i.basePath) {
						definitionPath = i.basePath.replace("/", "") + k;
						alias = i.basePath.replace("/", "");
					}
					this.resolveRefs(i.definitions[k], alias);
					a.definitions[definitionPath] = i.definitions[k];
				}
				return a;
			}, false);
			ret.schemes = schemes;
			ret.host = null;
			ret.basePath = null;
			res.send(ret);
		});
	}
	private resolveRefs(definition: {}, alias: string) {

		for (var p in definition) {
			if (typeof (definition[p]) === "object") {
				this.resolveRefs(definition[p], alias);
			} else {
				if (p === "$ref") {
					const valueToResolve = definition[p];
					const paths = valueToResolve.split("/");
					const resolved = alias + paths[paths.length - 1];
					paths[paths.length - 1] = resolved;
					definition[p] = paths.join("/");
				}
			}
		}
	}
}












