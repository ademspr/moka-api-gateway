import express, { Application, Request, Response } from "express";
import fs from "fs";
import https from "https";
import http from "http";
import cors from "cors";
import queryString from 'query-string';
import axios from "axios";
import chalk from "chalk";

export interface RouteConfig {
	basePath: string,
	match: string,
	replace: string,
	redirect: string,
	swagger: string
}
export default class GatewayServer {
	private httpPort: number;
	private sslPort: number | undefined;

	private app: Application;
	private routesConfig: RouteConfig[];

	private cert: string | undefined;
	private key: string | undefined;

	constructor(
		port: number,
		routesFile: string,
		sslPort?: number | undefined,
		cert?: string | undefined,
		key?: string | undefined) {
		this.httpPort = port;
		this.sslPort = sslPort;

		this.app = express();

		const data = fs.readFileSync(routesFile);
		const routesConfig: RouteConfig[] = JSON.parse(data.toString());

		this.routesConfig = routesConfig;
		this.cert = cert;
		this.key = key;
	}


	start() {
		console.log(chalk.blue('routes ' + JSON.stringify(this.routesConfig.map(r => r.basePath))));
		console.log(chalk.red('CTRL + C for end gateway'));
		this.app.all("*", cors(), (req, res) => this._handlerReq(req, res));
		this.app.use((req, res, next) => {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
			next();
		});


		if (this.sslPort !== undefined) {
			if (this.cert !== undefined && this.key !== undefined) {
				const httpsServer = https.createServer({
					key: fs.readFileSync(this.key),
					cert: fs.readFileSync(this.cert)
				}, this.app);

				httpsServer.listen(this.sslPort, () => {
					console.log(chalk.greenBright(`Moka gatway listening https on port ${this.sslPort}!`));
				});
			} else {
				console.error(chalk.red("HTTPS require certificate !"));
				return;
			}
		}


		const httpServer = http.createServer(this.app);
		httpServer.listen(this.httpPort, () => {
			console.log(chalk.green(`Moka gatway listening http on port ${this.httpPort}!`));
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

			console.log(chalk.blue(`[${req.method}] route ${req.path} redirect to ${redirectUrl}`));
			res.redirect(307, `${redirectUrl}${redirectPath}?${queryString.stringify(req.query)}`);


		} else {
			console.log(chalk.red(`route ${req.path} dont"t match.`));
			res.status(404).send("not found");
		}
	};

	private _resolveSwagger = (req: Request, res: Response) => {
		console.log(chalk.blue("swagger"));
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
