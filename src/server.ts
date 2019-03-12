import express, { Application, Request, Response } from 'express';
import { routesConfig } from './routes';
import fs from 'fs';
import axios from 'axios';

import https from 'https';
import http from 'http';

import swaggerCombine from 'swagger-combine';

console.log(swaggerCombine);

export interface RouteConfig {
	basePath: string,
	match: string,
	replace: string,
	redirect: string,
	swagger: string
}

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
		this.app.all('*', (req, res) => this._handlerReq(req, res));
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
			key: fs.readFileSync('server.key'),
			cert: fs.readFileSync('server.cert')
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

			console.log(`[${req.method}] route ${req.path} redirect to ${redirectUrl}`);
			const redirectPath = req.path.replace(replace, "").replace("//", "");

			res.redirect(`${redirectUrl}${redirectPath}`);
		} else {
			console.log(`route ${req.path} dont't match.`);
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
					a.paths[i.basePath + key] = i.paths[key];
				}
				for (var k in i.definitions) {
					a.definitions[i.basePath + k] = i.definitions[k];
				}
				return a;
			}, false);
			ret.schemes = schemes;
			ret.host = null;
			ret.basePath = null;
			res.send(ret);
		});
	}
}












