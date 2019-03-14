#!/usr/bin/env node
!function(e){var t={};function r(s){if(t[s])return t[s].exports;var o=t[s]={i:s,l:!1,exports:{}};return e[s].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,s){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(r.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(s,o,function(t){return e[t]}.bind(null,o));return s},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=2)}([function(e,t){e.exports=require("fs")},function(e,t){e.exports=require("chalk")},function(e,t,r){"use strict";var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),(new(s(r(3)).default)).startGateway()},function(e,t,r){"use strict";var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=s(r(4)),i=s(r(6)),n=s(r(1)),a=s(r(7)),l=s(r(8)),u=s(r(9));t.default=class{constructor(){this._path=new o.default}startGateway(){i.default();const e=l.default(process.argv.slice(2)),t=e.p||5e3,r=e.ssl||void 0,s=e.r||"routes.json",o=e.c,c=e.k;console.log(n.default.yellow(a.default.textSync("Moka Gateway",{horizontalLayout:"full"}))),console.log({port:t,sslPort:r,routesFile:s,serverCert:o,serverKey:c}),this._path.fileExists(s)?(this._server=new u.default(t,s,r,o,c),this._server.start()):console.error(n.default.red("routes files not exists"+s))}}},function(e,t,r){"use strict";var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=s(r(0)),i=s(r(5));t.default=class{constructor(){this.getCurrentDirectoryBase=(()=>i.default.basename(process.cwd()))}directoryExists(e){try{return o.default.statSync(e).isDirectory()}catch(e){return!1}}fileExists(e){try{return o.default.existsSync(e)}catch(e){return!1}}}},function(e,t){e.exports=require("path")},function(e,t){e.exports=require("clear")},function(e,t){e.exports=require("figlet")},function(e,t){e.exports=require("minimist")},function(e,t,r){"use strict";var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=s(r(10)),i=s(r(0)),n=s(r(11)),a=s(r(12)),l=s(r(13)),u=s(r(14)),c=s(r(15)),f=s(r(1));t.default=class{constructor(e,t,r,s,a){this._handlerReq=((e,t)=>{if("/swagger/docs"===e.path)return this._resolveSwagger(e,t);const r=this.routesConfig.filter(t=>{if(new RegExp(t.match).exec(e.path))return!0})[0];if(r){const s=r.redirect,o=r.replace,i=e.path.replace(o,"").replace("//","");console.log(f.default.blue(`[${e.method}] route ${e.path} redirect to ${s}`)),t.redirect(307,`${s}${i}?${u.default.stringify(e.query)}`)}else console.log(f.default.red(`route ${e.path} dont"t match.`)),t.status(404).send("not found")}),this._resolveSwagger=((e,t)=>{const r=this.routesConfig.filter(e=>""!==e.swagger),s=new n.default.Agent({rejectUnauthorized:!1}),o=r.map(e=>c.default.get(e.swagger,{httpsAgent:s}).then(e=>e.data)),i=[e.protocol];Promise.all(o).then(e=>{const r=e.reduce((e,t)=>{for(var r in e||((e=Object.assign({},t)).paths={},e.definitions={}),t.paths){let s=r,o="";t.basePath&&(s=t.basePath.replace("/","")+r,o=t.basePath.replace("/","")),this.resolveRefs(t.paths[r],o),e.paths[s]=t.paths[r]}for(var s in t.definitions){let r=s,o="";t.basePath&&(r=t.basePath.replace("/","")+s,o=t.basePath.replace("/","")),this.resolveRefs(t.definitions[s],o),e.definitions[r]=t.definitions[s]}return e},!1);r.schemes=i,r.host=null,r.basePath=null,t.send(r)})}),this.httpPort=e,this.sslPort=r,this.app=o.default();const l=i.default.readFileSync(t),d=JSON.parse(l.toString());this.routesConfig=d,this.cert=s,this.key=a}start(){if(console.log(f.default.blue("routes "+JSON.stringify(this.routesConfig.map(e=>e.basePath)))),console.log(f.default.red("CTRL + C for end gateway")),this.app.all("*",l.default(),(e,t)=>this._handlerReq(e,t)),this.app.use((e,t,r)=>{t.header("Access-Control-Allow-Origin","*"),t.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization"),r()}),void 0!==this.sslPort){if(void 0===this.cert||void 0===this.key)return void console.error(f.default.red("HTTPS require certificate !"));n.default.createServer({key:i.default.readFileSync(this.key),cert:i.default.readFileSync(this.cert)},this.app).listen(this.sslPort,()=>{console.log(f.default.greenBright(`Moka gatway listening https on port ${this.sslPort}!`))})}a.default.createServer(this.app).listen(this.httpPort,()=>{console.log(f.default.green(`Moka gatway listening http on port ${this.httpPort}!`))})}resolveRefs(e,t){for(var r in e)if("object"==typeof e[r])this.resolveRefs(e[r],t);else if("$ref"===r){const s=e[r].split("/"),o=t+s[s.length-1];s[s.length-1]=o,e[r]=s.join("/")}}}},function(e,t){e.exports=require("express")},function(e,t){e.exports=require("https")},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("cors")},function(e,t){e.exports=require("query-string")},function(e,t){e.exports=require("axios")}]);