import fs from "fs";
import path from "path";

export default class Path {
	getCurrentDirectoryBase = (): string => path.basename(process.cwd());
	directoryExists(dirPath: string) {
		try {
			return fs.statSync(dirPath).isDirectory();
		} catch (err) {
			return false;
		}
	}
	fileExists(filePath: string) {
		try {
			return fs.existsSync(filePath);
		} catch (err) {
			return false;
		}
	}

}