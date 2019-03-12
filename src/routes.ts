import { RouteConfig } from "./server";

export const routesConfig: RouteConfig[] = [
	{
		"basePath": "/v1",
		"match": "^\/v1\/*",
		"replace": "v1",
		"redirect": "http://localhost:12104/v1/",
		"swagger": "https://app.swaggerhub.com/apiproxy/registry/adMooH/ad-moo_h/1.1.1"
	},
	{
		"basePath": "/v2",
		"match": "^\/v2\/*",
		"replace": "v2",
		"redirect": "http://localhost:12104/v2/",
		"swagger": "http://localhost:12104/v2/swagger/docs"
	},
	{
		"basePath": "/content",
		"match": "^\/content\/*",
		"replace": "content",
		"redirect": "http://localhost:51372/",
		"swagger": "https://localhost:44369/swagger/v1/swagger.json"
	}
];