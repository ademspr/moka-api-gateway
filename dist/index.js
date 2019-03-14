#!/usr/bin/env node
!function (e) { var t = {}; function r(s) { if (t[s]) return t[s].exports; var o = t[s] = { i: s, l: !1, exports: {} }; return e[s].call(o.exports, o, o.exports, r), o.l = !0, o.exports } r.m = e, r.c = t, r.d = function (e, t, s) { r.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: s }) }, r.r = function (e) { "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 }) }, r.t = function (e, t) { if (1 & t && (e = r(e)), 8 & t) return e; if (4 & t && "object" == typeof e && e && e.__esModule) return e; var s = Object.create(null); if (r.r(s), Object.defineProperty(s, "default", { enumerable: !0, value: e }), 2 & t && "string" != typeof e) for (var o in e) r.d(s, o, function (t) { return e[t] }.bind(null, o)); return s }, r.n = function (e) { var t = e && e.__esModule ? function () { return e.default } : function () { return e }; return r.d(t, "a", t), t }, r.o = function (e, t) { return Object.prototype.hasOwnProperty.call(e, t) }, r.p = "", r(r.s = 2) }([function (e, t) { e.exports = require("fs") }, function (e, t) { e.exports = require("chalk") }, function (e, t, r) { "use strict"; var s = this && this.__importDefault || function (e) { return e && e.__esModule ? e : { default: e } }; Object.defineProperty(t, "__esModule", { value: !0 }), (new (s(r(3)).default)).startGateway() }, function (e, t, r) { "use strict"; var s = this && this.__importDefault || function (e) { return e && e.__esModule ? e : { default: e } }; Object.defineProperty(t, "__esModule", { value: !0 }); const o = s(r(4)), n = s(r(6)), i = s(r(1)), a = s(r(7)), l = s(r(8)), u = s(r(9)); t.default = class { constructor() { this._path = new o.default } startGateway() { n.default(); const e = l.default(process.argv.slice(2)), t = e.p || 5e3, r = e.ssl || void 0, s = e.r || "routes.json"; console.log(i.default.yellow(a.default.textSync("Moka Gateway", { horizontalLayout: "full" }))), console.log({ port: t, sslPort: r, routesFile: s }), this._path.fileExists(s) ? (this._server = new u.default(t, r), this._server.start()) : console.error(i.default.red("routes files not exists" + s)) } } }, function (e, t, r) { "use strict"; var s = this && this.__importDefault || function (e) { return e && e.__esModule ? e : { default: e } }; Object.defineProperty(t, "__esModule", { value: !0 }); const o = s(r(0)), n = s(r(5)); t.default = class { constructor() { this.getCurrentDirectoryBase = (() => n.default.basename(process.cwd())) } directoryExists(e) { try { return o.default.statSync(e).isDirectory() } catch (e) { return !1 } } fileExists(e) { try { return o.default.existsSync(e) } catch (e) { return !1 } } } }, function (e, t) { e.exports = require("path") }, function (e, t) { e.exports = require("clear") }, function (e, t) { e.exports = require("figlet") }, function (e, t) { e.exports = require("minimist") }, function (e, t, r) { "use strict"; var s = this && this.__importDefault || function (e) { return e && e.__esModule ? e : { default: e } }; Object.defineProperty(t, "__esModule", { value: !0 }); const o = s(r(10)), n = s(r(0)), i = s(r(11)), a = s(r(12)), l = s(r(13)), u = s(r(14)), c = s(r(15)), f = s(r(1)), d = n.default.readFileSync("routes.json"), p = JSON.parse(d.toString()); t.default = class { constructor(e, t) { this._handlerReq = ((e, t) => { if ("/swagger/docs" === e.path) return this._resolveSwagger(e, t); const r = this.routesConfig.filter(t => { if (new RegExp(t.match).exec(e.path)) return !0 })[0]; if (r) { const s = r.redirect, o = r.replace, n = e.path.replace(o, "").replace("//", ""); console.log(f.default.blue(`[${e.method}] route ${e.path} redirect to ${s}`)), t.redirect(307, `${s}${n}?${u.default.stringify(e.query)}`) } else console.log(f.default.red(`route ${e.path} dont"t match.`)), t.status(404).send("not found") }), this._resolveSwagger = ((e, t) => { const r = this.routesConfig.filter(e => "" !== e.swagger), s = new i.default.Agent({ rejectUnauthorized: !1 }), o = r.map(e => c.default.get(e.swagger, { httpsAgent: s }).then(e => e.data)), n = [e.protocol]; Promise.all(o).then(e => { const r = e.reduce((e, t) => { for (var r in e || ((e = Object.assign({}, t)).paths = {}, e.definitions = {}), t.paths) { let s = r, o = ""; t.basePath && (s = t.basePath.replace("/", "") + r, o = t.basePath.replace("/", "")), this.resolveRefs(t.paths[r], o), e.paths[s] = t.paths[r] } for (var s in t.definitions) { let r = s, o = ""; t.basePath && (r = t.basePath.replace("/", "") + s, o = t.basePath.replace("/", "")), this.resolveRefs(t.definitions[s], o), e.definitions[r] = t.definitions[s] } return e }, !1); r.schemes = n, r.host = null, r.basePath = null, t.send(r) }) }), this.httpPort = e, this.sslPort = t, this.app = o.default(), this.routesConfig = p } start() { console.log(f.default.blue("routes " + JSON.stringify(this.routesConfig.map(e => e.basePath)))), console.log(f.default.red("CTRL + C for end gateway")), this.app.all("*", l.default(), (e, t) => this._handlerReq(e, t)), this.app.use((e, t, r) => { t.header("Access-Control-Allow-Origin", "*"), t.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"), r() }), a.default.createServer(this.app).listen(this.httpPort, () => { console.log(f.default.green(`Moka gatway listening http on port ${this.httpPort}!`)) }); const e = i.default.createServer({ key: n.default.readFileSync("server.key"), cert: n.default.readFileSync("server.cert") }, this.app); this.sslPort && e.listen(this.sslPort, () => { console.log(f.default.greenBright(`Moka gatway listening https on port ${this.sslPort}!`)) }) } resolveRefs(e, t) { for (var r in e) if ("object" == typeof e[r]) this.resolveRefs(e[r], t); else if ("$ref" === r) { const s = e[r].split("/"), o = t + s[s.length - 1]; s[s.length - 1] = o, e[r] = s.join("/") } } } }, function (e, t) { e.exports = require("express") }, function (e, t) { e.exports = require("https") }, function (e, t) { e.exports = require("http") }, function (e, t) { e.exports = require("cors") }, function (e, t) { e.exports = require("query-string") }, function (e, t) { e.exports = require("axios") }]);