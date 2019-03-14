import Path from "./path";
import clear from "clear";
import chalk from "chalk";
import figlet from "figlet";
import minimist from "minimist";

import GatewayServer from "../server/gateway";

export default class MokaCli {
	private _path = new Path();
	private _server: GatewayServer;
	startGateway(): void {
		clear();
		const argv = minimist(process.argv.slice(2));

		const port: number = argv.p || 5000;
		const sslPort: number | undefined = argv.ssl || undefined;
		const routesFile: string = argv.r || "routes.json";

		const serverCert: string | undefined = argv.c;
		const serverKey: string | undefined = argv.k;

		console.log(
			chalk.yellow(figlet.textSync("Moka Gateway", { horizontalLayout: 'full' }))
		);
		console.log({
			port,
			sslPort,
			routesFile,
			serverCert,
			serverKey
		});
		if (!this._path.fileExists(routesFile)) {
			console.error(chalk.red("routes files not exists" + routesFile));
			return;
		}
		this._server = new GatewayServer(port, routesFile, sslPort, serverCert, serverKey);
		this._server.start();
	}
}