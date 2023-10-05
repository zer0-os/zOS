// @license magnet:?xt=urn:btih:8e4f440f4c65981c5bf93c76d35135ba5064d8b7&dn=apache-2.0.txt Apache-2.0
// @source: https://gitlab.matrix.org/matrix-org/olm/-/tree/3.2.15

var Olm = (function () {
  var olm_exports = {};
  var onInitSuccess;
  var onInitFail;

  var Module = (() => {
    var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
    if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
    return function (Module) {
      Module = Module || {};

      var a;
      a || (a = typeof Module !== 'undefined' ? Module : {});
      var aa, ca;
      a.ready = new Promise(function (b, c) {
        aa = b;
        ca = c;
      });
      var g;
      if ('undefined' !== typeof window)
        g = function (b) {
          window.crypto.getRandomValues(b);
        };
      else if (module.exports) {
        var da = require('crypto');
        g = function (b) {
          var c = da.randomBytes(b.length);
          b.set(c);
        };
      } else throw Error('Cannot find global to attach library to');
      if ('undefined' !== typeof OLM_OPTIONS)
        for (var ea in OLM_OPTIONS) OLM_OPTIONS.hasOwnProperty(ea) && (a[ea] = OLM_OPTIONS[ea]);
      a.onRuntimeInitialized = function () {
        h = a._olm_error();
        olm_exports.PRIVATE_KEY_LENGTH = a._olm_pk_private_key_length();
        onInitSuccess && onInitSuccess();
      };
      a.onAbort = function (b) {
        onInitFail && onInitFail(b);
      };
      var fa = Object.assign({}, a),
        ha = 'object' == typeof window,
        l = 'function' == typeof importScripts,
        ia =
          'object' == typeof process && 'object' == typeof process.versions && 'string' == typeof process.versions.node,
        m = '',
        ja,
        ka,
        la,
        fs,
        ma,
        na;
      if (ia)
        (m = l ? require('path').dirname(m) + '/' : __dirname + '/'),
          (na = () => {
            ma || ((fs = require('fs')), (ma = require('path')));
          }),
          (ja = function (b, c) {
            na();
            b = ma.normalize(b);
            return fs.readFileSync(b, c ? void 0 : 'utf8');
          }),
          (la = (b) => {
            b = ja(b, !0);
            b.buffer || (b = new Uint8Array(b));
            return b;
          }),
          (ka = (b, c, d) => {
            na();
            b = ma.normalize(b);
            fs.readFile(b, function (e, f) {
              e ? d(e) : c(f.buffer);
            });
          }),
          1 < process.argv.length && process.argv[1].replace(/\\/g, '/'),
          process.argv.slice(2),
          process.on('uncaughtException', function (b) {
            throw b;
          }),
          process.on('unhandledRejection', function (b) {
            throw b;
          }),
          (a.inspect = function () {
            return '[Emscripten Module object]';
          });
      else if (ha || l)
        l
          ? (m = self.location.href)
          : 'undefined' != typeof document && document.currentScript && (m = document.currentScript.src),
          _scriptDir && (m = _scriptDir),
          0 !== m.indexOf('blob:') ? (m = m.substr(0, m.replace(/[?#].*/, '').lastIndexOf('/') + 1)) : (m = ''),
          (ja = (b) => {
            var c = new XMLHttpRequest();
            c.open('GET', b, !1);
            c.send(null);
            return c.responseText;
          }),
          l &&
            (la = (b) => {
              var c = new XMLHttpRequest();
              c.open('GET', b, !1);
              c.responseType = 'arraybuffer';
              c.send(null);
              return new Uint8Array(c.response);
            }),
          (ka = (b, c, d) => {
            var e = new XMLHttpRequest();
            e.open('GET', b, !0);
            e.responseType = 'arraybuffer';
            e.onload = () => {
              200 == e.status || (0 == e.status && e.response) ? c(e.response) : d();
            };
            e.onerror = d;
            e.send(null);
          });
      a.print || console.log.bind(console);
      var n = a.printErr || console.warn.bind(console);
      Object.assign(a, fa);
      fa = null;
      var q;
      a.wasmBinary && (q = a.wasmBinary);
      var noExitRuntime = a.noExitRuntime || !0;
      'object' != typeof WebAssembly && r('no native wasm support detected');
      var oa,
        pa = !1,
        qa = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0;
      function t(b, c) {
        if (b) {
          var d = u,
            e = b + c;
          for (c = b; d[c] && !(c >= e); ) ++c;
          if (16 < c - b && d.buffer && qa) b = qa.decode(d.subarray(b, c));
          else {
            for (e = ''; b < c; ) {
              var f = d[b++];
              if (f & 128) {
                var k = d[b++] & 63;
                if (192 == (f & 224)) e += String.fromCharCode(((f & 31) << 6) | k);
                else {
                  var p = d[b++] & 63;
                  f =
                    224 == (f & 240)
                      ? ((f & 15) << 12) | (k << 6) | p
                      : ((f & 7) << 18) | (k << 12) | (p << 6) | (d[b++] & 63);
                  65536 > f
                    ? (e += String.fromCharCode(f))
                    : ((f -= 65536), (e += String.fromCharCode(55296 | (f >> 10), 56320 | (f & 1023))));
                }
              } else e += String.fromCharCode(f);
            }
            b = e;
          }
        } else b = '';
        return b;
      }
      function ra(b, c, d, e) {
        if (!(0 < e)) return 0;
        var f = d;
        e = d + e - 1;
        for (var k = 0; k < b.length; ++k) {
          var p = b.charCodeAt(k);
          if (55296 <= p && 57343 >= p) {
            var w = b.charCodeAt(++k);
            p = (65536 + ((p & 1023) << 10)) | (w & 1023);
          }
          if (127 >= p) {
            if (d >= e) break;
            c[d++] = p;
          } else {
            if (2047 >= p) {
              if (d + 1 >= e) break;
              c[d++] = 192 | (p >> 6);
            } else {
              if (65535 >= p) {
                if (d + 2 >= e) break;
                c[d++] = 224 | (p >> 12);
              } else {
                if (d + 3 >= e) break;
                c[d++] = 240 | (p >> 18);
                c[d++] = 128 | ((p >> 12) & 63);
              }
              c[d++] = 128 | ((p >> 6) & 63);
            }
            c[d++] = 128 | (p & 63);
          }
        }
        c[d] = 0;
        return d - f;
      }
      function v(b, c, d) {
        return ra(b, u, c, d);
      }
      function x(b) {
        for (var c = 0, d = 0; d < b.length; ++d) {
          var e = b.charCodeAt(d);
          127 >= e ? c++ : 2047 >= e ? (c += 2) : 55296 <= e && 57343 >= e ? ((c += 4), ++d) : (c += 3);
        }
        return c;
      }
      var sa, y, u, ta, z, ua, va, wa;
      function xa() {
        var b = oa.buffer;
        sa = b;
        a.HEAP8 = y = new Int8Array(b);
        a.HEAP16 = ta = new Int16Array(b);
        a.HEAP32 = z = new Int32Array(b);
        a.HEAPU8 = u = new Uint8Array(b);
        a.HEAPU16 = new Uint16Array(b);
        a.HEAPU32 = ua = new Uint32Array(b);
        a.HEAPF32 = va = new Float32Array(b);
        a.HEAPF64 = wa = new Float64Array(b);
      }
      var za = [],
        Aa = [],
        Ba = [];
      function Ca() {
        var b = a.preRun.shift();
        za.unshift(b);
      }
      var A = 0,
        Da = null,
        B = null;
      function r(b) {
        if (a.onAbort) a.onAbort(b);
        b = 'Aborted(' + b + ')';
        n(b);
        pa = !0;
        b = new WebAssembly.RuntimeError(b + '. Build with -sASSERTIONS for more info.');
        ca(b);
        throw b;
      }
      function Ea() {
        return C.startsWith('data:application/octet-stream;base64,');
      }
      var C;
      C = 'olm.wasm';
      if (!Ea()) {
        var Fa = C;
        C = a.locateFile ? a.locateFile(Fa, m) : m + Fa;
      }
      function Ga() {
        var b = C;
        try {
          if (b == C && q) return new Uint8Array(q);
          if (la) return la(b);
          throw 'both async and sync fetching of the wasm failed';
        } catch (c) {
          r(c);
        }
      }
      function Ha() {
        if (!q && (ha || l)) {
          if ('function' == typeof fetch && !C.startsWith('file://'))
            return fetch(C, { credentials: 'same-origin' })
              .then(function (b) {
                if (!b.ok) throw "failed to load wasm binary file at '" + C + "'";
                return b.arrayBuffer();
              })
              .catch(function () {
                return Ga();
              });
          if (ka)
            return new Promise(function (b, c) {
              ka(
                C,
                function (d) {
                  b(new Uint8Array(d));
                },
                c
              );
            });
        }
        return Promise.resolve().then(function () {
          return Ga();
        });
      }
      var Ia;
      function Ja(b) {
        for (; 0 < b.length; ) b.shift()(a);
      }
      function Ka(b, c = 'i8') {
        c.endsWith('*') && (c = '*');
        switch (c) {
          case 'i1':
            return y[b >> 0];
          case 'i8':
            return y[b >> 0];
          case 'i16':
            return ta[b >> 1];
          case 'i32':
            return z[b >> 2];
          case 'i64':
            return z[b >> 2];
          case 'float':
            return va[b >> 2];
          case 'double':
            return wa[b >> 3];
          case '*':
            return ua[b >> 2];
          default:
            r('invalid type for getValue: ' + c);
        }
        return null;
      }
      function D(b) {
        var c = 'i8';
        c.endsWith('*') && (c = '*');
        switch (c) {
          case 'i1':
            y[b >> 0] = 0;
            break;
          case 'i8':
            y[b >> 0] = 0;
            break;
          case 'i16':
            ta[b >> 1] = 0;
            break;
          case 'i32':
            z[b >> 2] = 0;
            break;
          case 'i64':
            Ia = [0, 0];
            z[b >> 2] = Ia[0];
            z[(b + 4) >> 2] = Ia[1];
            break;
          case 'float':
            va[b >> 2] = 0;
            break;
          case 'double':
            wa[b >> 3] = 0;
            break;
          case '*':
            ua[b >> 2] = 0;
            break;
          default:
            r('invalid type for setValue: ' + c);
        }
      }
      function La(b, c, d) {
        for (var e = 0; e < b.length; ++e) y[c++ >> 0] = b.charCodeAt(e);
        d || (y[c >> 0] = 0);
      }
      function Ma(b, c, d) {
        d = Array(0 < d ? d : x(b) + 1);
        b = ra(b, d, 0, d.length);
        c && (d.length = b);
        return d;
      }
      var Na = {
        b: function (b, c, d) {
          u.copyWithin(b, c, c + d);
        },
        a: function (b) {
          var c = u.length;
          b >>>= 0;
          if (2147483648 < b) return !1;
          for (var d = 1; 4 >= d; d *= 2) {
            var e = c * (1 + 0.2 / d);
            e = Math.min(e, b + 100663296);
            var f = Math;
            e = Math.max(b, e);
            f = f.min.call(f, 2147483648, e + ((65536 - (e % 65536)) % 65536));
            a: {
              try {
                oa.grow((f - sa.byteLength + 65535) >>> 16);
                xa();
                var k = 1;
                break a;
              } catch (p) {}
              k = void 0;
            }
            if (k) return !0;
          }
          return !1;
        },
      };
      (function () {
        function b(f) {
          a.asm = f.exports;
          oa = a.asm.c;
          xa();
          Aa.unshift(a.asm.d);
          A--;
          a.monitorRunDependencies && a.monitorRunDependencies(A);
          0 == A && (null !== Da && (clearInterval(Da), (Da = null)), B && ((f = B), (B = null), f()));
        }
        function c(f) {
          b(f.instance);
        }
        function d(f) {
          return Ha()
            .then(function (k) {
              return WebAssembly.instantiate(k, e);
            })
            .then(function (k) {
              return k;
            })
            .then(f, function (k) {
              n('failed to asynchronously prepare wasm: ' + k);
              r(k);
            });
        }
        var e = { a: Na };
        A++;
        a.monitorRunDependencies && a.monitorRunDependencies(A);
        if (a.instantiateWasm)
          try {
            return a.instantiateWasm(e, b);
          } catch (f) {
            return n('Module.instantiateWasm callback failed with error: ' + f), !1;
          }
        (function () {
          return q ||
            'function' != typeof WebAssembly.instantiateStreaming ||
            Ea() ||
            C.startsWith('file://') ||
            ia ||
            'function' != typeof fetch
            ? d(c)
            : fetch(C, { credentials: 'same-origin' }).then(function (f) {
                return WebAssembly.instantiateStreaming(f, e).then(c, function (k) {
                  n('wasm streaming compile failed: ' + k);
                  n('falling back to ArrayBuffer instantiation');
                  return d(c);
                });
              });
        })().catch(ca);
        return {};
      })();
      a.___wasm_call_ctors = function () {
        return (a.___wasm_call_ctors = a.asm.d).apply(null, arguments);
      };
      a._olm_get_library_version = function () {
        return (a._olm_get_library_version = a.asm.f).apply(null, arguments);
      };
      a._olm_error = function () {
        return (a._olm_error = a.asm.g).apply(null, arguments);
      };
      a._olm_account_last_error = function () {
        return (a._olm_account_last_error = a.asm.h).apply(null, arguments);
      };
      a.__olm_error_to_string = function () {
        return (a.__olm_error_to_string = a.asm.i).apply(null, arguments);
      };
      a._olm_account_last_error_code = function () {
        return (a._olm_account_last_error_code = a.asm.j).apply(null, arguments);
      };
      a._olm_session_last_error = function () {
        return (a._olm_session_last_error = a.asm.k).apply(null, arguments);
      };
      a._olm_session_last_error_code = function () {
        return (a._olm_session_last_error_code = a.asm.l).apply(null, arguments);
      };
      a._olm_utility_last_error = function () {
        return (a._olm_utility_last_error = a.asm.m).apply(null, arguments);
      };
      a._olm_utility_last_error_code = function () {
        return (a._olm_utility_last_error_code = a.asm.n).apply(null, arguments);
      };
      a._olm_account_size = function () {
        return (a._olm_account_size = a.asm.o).apply(null, arguments);
      };
      a._olm_session_size = function () {
        return (a._olm_session_size = a.asm.p).apply(null, arguments);
      };
      a._olm_utility_size = function () {
        return (a._olm_utility_size = a.asm.q).apply(null, arguments);
      };
      a._olm_account = function () {
        return (a._olm_account = a.asm.r).apply(null, arguments);
      };
      a._olm_session = function () {
        return (a._olm_session = a.asm.s).apply(null, arguments);
      };
      a._olm_utility = function () {
        return (a._olm_utility = a.asm.t).apply(null, arguments);
      };
      a._olm_clear_account = function () {
        return (a._olm_clear_account = a.asm.u).apply(null, arguments);
      };
      a._olm_clear_session = function () {
        return (a._olm_clear_session = a.asm.v).apply(null, arguments);
      };
      a._olm_clear_utility = function () {
        return (a._olm_clear_utility = a.asm.w).apply(null, arguments);
      };
      a._olm_pickle_account_length = function () {
        return (a._olm_pickle_account_length = a.asm.x).apply(null, arguments);
      };
      a._olm_pickle_session_length = function () {
        return (a._olm_pickle_session_length = a.asm.y).apply(null, arguments);
      };
      a._olm_pickle_account = function () {
        return (a._olm_pickle_account = a.asm.z).apply(null, arguments);
      };
      a._olm_pickle_session = function () {
        return (a._olm_pickle_session = a.asm.A).apply(null, arguments);
      };
      a._olm_unpickle_account = function () {
        return (a._olm_unpickle_account = a.asm.B).apply(null, arguments);
      };
      a._olm_unpickle_session = function () {
        return (a._olm_unpickle_session = a.asm.C).apply(null, arguments);
      };
      a._olm_create_account_random_length = function () {
        return (a._olm_create_account_random_length = a.asm.D).apply(null, arguments);
      };
      a._olm_create_account = function () {
        return (a._olm_create_account = a.asm.E).apply(null, arguments);
      };
      a._olm_account_identity_keys_length = function () {
        return (a._olm_account_identity_keys_length = a.asm.F).apply(null, arguments);
      };
      a._olm_account_identity_keys = function () {
        return (a._olm_account_identity_keys = a.asm.G).apply(null, arguments);
      };
      a._olm_account_signature_length = function () {
        return (a._olm_account_signature_length = a.asm.H).apply(null, arguments);
      };
      a._olm_account_sign = function () {
        return (a._olm_account_sign = a.asm.I).apply(null, arguments);
      };
      a._olm_account_one_time_keys_length = function () {
        return (a._olm_account_one_time_keys_length = a.asm.J).apply(null, arguments);
      };
      a._olm_account_one_time_keys = function () {
        return (a._olm_account_one_time_keys = a.asm.K).apply(null, arguments);
      };
      a._olm_account_mark_keys_as_published = function () {
        return (a._olm_account_mark_keys_as_published = a.asm.L).apply(null, arguments);
      };
      a._olm_account_max_number_of_one_time_keys = function () {
        return (a._olm_account_max_number_of_one_time_keys = a.asm.M).apply(null, arguments);
      };
      a._olm_account_generate_one_time_keys_random_length = function () {
        return (a._olm_account_generate_one_time_keys_random_length = a.asm.N).apply(null, arguments);
      };
      a._olm_account_generate_one_time_keys = function () {
        return (a._olm_account_generate_one_time_keys = a.asm.O).apply(null, arguments);
      };
      a._olm_account_generate_fallback_key_random_length = function () {
        return (a._olm_account_generate_fallback_key_random_length = a.asm.P).apply(null, arguments);
      };
      a._olm_account_generate_fallback_key = function () {
        return (a._olm_account_generate_fallback_key = a.asm.Q).apply(null, arguments);
      };
      a._olm_account_fallback_key_length = function () {
        return (a._olm_account_fallback_key_length = a.asm.R).apply(null, arguments);
      };
      a._olm_account_fallback_key = function () {
        return (a._olm_account_fallback_key = a.asm.S).apply(null, arguments);
      };
      a._olm_account_unpublished_fallback_key_length = function () {
        return (a._olm_account_unpublished_fallback_key_length = a.asm.T).apply(null, arguments);
      };
      a._olm_account_unpublished_fallback_key = function () {
        return (a._olm_account_unpublished_fallback_key = a.asm.U).apply(null, arguments);
      };
      a._olm_account_forget_old_fallback_key = function () {
        return (a._olm_account_forget_old_fallback_key = a.asm.V).apply(null, arguments);
      };
      a._olm_create_outbound_session_random_length = function () {
        return (a._olm_create_outbound_session_random_length = a.asm.W).apply(null, arguments);
      };
      a._olm_create_outbound_session = function () {
        return (a._olm_create_outbound_session = a.asm.X).apply(null, arguments);
      };
      a._olm_create_inbound_session = function () {
        return (a._olm_create_inbound_session = a.asm.Y).apply(null, arguments);
      };
      a._olm_create_inbound_session_from = function () {
        return (a._olm_create_inbound_session_from = a.asm.Z).apply(null, arguments);
      };
      a._olm_session_id_length = function () {
        return (a._olm_session_id_length = a.asm._).apply(null, arguments);
      };
      a._olm_session_id = function () {
        return (a._olm_session_id = a.asm.$).apply(null, arguments);
      };
      a._olm_session_has_received_message = function () {
        return (a._olm_session_has_received_message = a.asm.aa).apply(null, arguments);
      };
      a._olm_session_describe = function () {
        return (a._olm_session_describe = a.asm.ba).apply(null, arguments);
      };
      a._olm_matches_inbound_session = function () {
        return (a._olm_matches_inbound_session = a.asm.ca).apply(null, arguments);
      };
      a._olm_matches_inbound_session_from = function () {
        return (a._olm_matches_inbound_session_from = a.asm.da).apply(null, arguments);
      };
      a._olm_remove_one_time_keys = function () {
        return (a._olm_remove_one_time_keys = a.asm.ea).apply(null, arguments);
      };
      a._olm_encrypt_message_type = function () {
        return (a._olm_encrypt_message_type = a.asm.fa).apply(null, arguments);
      };
      a._olm_encrypt_random_length = function () {
        return (a._olm_encrypt_random_length = a.asm.ga).apply(null, arguments);
      };
      a._olm_encrypt_message_length = function () {
        return (a._olm_encrypt_message_length = a.asm.ha).apply(null, arguments);
      };
      a._olm_encrypt = function () {
        return (a._olm_encrypt = a.asm.ia).apply(null, arguments);
      };
      a._olm_decrypt_max_plaintext_length = function () {
        return (a._olm_decrypt_max_plaintext_length = a.asm.ja).apply(null, arguments);
      };
      a._olm_decrypt = function () {
        return (a._olm_decrypt = a.asm.ka).apply(null, arguments);
      };
      a._olm_sha256_length = function () {
        return (a._olm_sha256_length = a.asm.la).apply(null, arguments);
      };
      a._olm_sha256 = function () {
        return (a._olm_sha256 = a.asm.ma).apply(null, arguments);
      };
      a._olm_ed25519_verify = function () {
        return (a._olm_ed25519_verify = a.asm.na).apply(null, arguments);
      };
      a._olm_pk_encryption_last_error = function () {
        return (a._olm_pk_encryption_last_error = a.asm.oa).apply(null, arguments);
      };
      a._olm_pk_encryption_last_error_code = function () {
        return (a._olm_pk_encryption_last_error_code = a.asm.pa).apply(null, arguments);
      };
      a._olm_pk_encryption_size = function () {
        return (a._olm_pk_encryption_size = a.asm.qa).apply(null, arguments);
      };
      a._olm_pk_encryption = function () {
        return (a._olm_pk_encryption = a.asm.ra).apply(null, arguments);
      };
      a._olm_clear_pk_encryption = function () {
        return (a._olm_clear_pk_encryption = a.asm.sa).apply(null, arguments);
      };
      a._olm_pk_encryption_set_recipient_key = function () {
        return (a._olm_pk_encryption_set_recipient_key = a.asm.ta).apply(null, arguments);
      };
      a._olm_pk_key_length = function () {
        return (a._olm_pk_key_length = a.asm.ua).apply(null, arguments);
      };
      a._olm_pk_ciphertext_length = function () {
        return (a._olm_pk_ciphertext_length = a.asm.va).apply(null, arguments);
      };
      a._olm_pk_mac_length = function () {
        return (a._olm_pk_mac_length = a.asm.wa).apply(null, arguments);
      };
      a._olm_pk_encrypt_random_length = function () {
        return (a._olm_pk_encrypt_random_length = a.asm.xa).apply(null, arguments);
      };
      a._olm_pk_encrypt = function () {
        return (a._olm_pk_encrypt = a.asm.ya).apply(null, arguments);
      };
      a._olm_pk_decryption_last_error = function () {
        return (a._olm_pk_decryption_last_error = a.asm.za).apply(null, arguments);
      };
      a._olm_pk_decryption_last_error_code = function () {
        return (a._olm_pk_decryption_last_error_code = a.asm.Aa).apply(null, arguments);
      };
      a._olm_pk_decryption_size = function () {
        return (a._olm_pk_decryption_size = a.asm.Ba).apply(null, arguments);
      };
      a._olm_pk_decryption = function () {
        return (a._olm_pk_decryption = a.asm.Ca).apply(null, arguments);
      };
      a._olm_clear_pk_decryption = function () {
        return (a._olm_clear_pk_decryption = a.asm.Da).apply(null, arguments);
      };
      a._olm_pk_private_key_length = function () {
        return (a._olm_pk_private_key_length = a.asm.Ea).apply(null, arguments);
      };
      a._olm_pk_generate_key_random_length = function () {
        return (a._olm_pk_generate_key_random_length = a.asm.Fa).apply(null, arguments);
      };
      a._olm_pk_key_from_private = function () {
        return (a._olm_pk_key_from_private = a.asm.Ga).apply(null, arguments);
      };
      a._olm_pk_generate_key = function () {
        return (a._olm_pk_generate_key = a.asm.Ha).apply(null, arguments);
      };
      a._olm_pickle_pk_decryption_length = function () {
        return (a._olm_pickle_pk_decryption_length = a.asm.Ia).apply(null, arguments);
      };
      a._olm_pickle_pk_decryption = function () {
        return (a._olm_pickle_pk_decryption = a.asm.Ja).apply(null, arguments);
      };
      a._olm_unpickle_pk_decryption = function () {
        return (a._olm_unpickle_pk_decryption = a.asm.Ka).apply(null, arguments);
      };
      a._olm_pk_max_plaintext_length = function () {
        return (a._olm_pk_max_plaintext_length = a.asm.La).apply(null, arguments);
      };
      a._olm_pk_decrypt = function () {
        return (a._olm_pk_decrypt = a.asm.Ma).apply(null, arguments);
      };
      a._olm_pk_get_private_key = function () {
        return (a._olm_pk_get_private_key = a.asm.Na).apply(null, arguments);
      };
      a._olm_pk_signing_size = function () {
        return (a._olm_pk_signing_size = a.asm.Oa).apply(null, arguments);
      };
      a._olm_pk_signing = function () {
        return (a._olm_pk_signing = a.asm.Pa).apply(null, arguments);
      };
      a._olm_pk_signing_last_error = function () {
        return (a._olm_pk_signing_last_error = a.asm.Qa).apply(null, arguments);
      };
      a._olm_pk_signing_last_error_code = function () {
        return (a._olm_pk_signing_last_error_code = a.asm.Ra).apply(null, arguments);
      };
      a._olm_clear_pk_signing = function () {
        return (a._olm_clear_pk_signing = a.asm.Sa).apply(null, arguments);
      };
      a._olm_pk_signing_seed_length = function () {
        return (a._olm_pk_signing_seed_length = a.asm.Ta).apply(null, arguments);
      };
      a._olm_pk_signing_public_key_length = function () {
        return (a._olm_pk_signing_public_key_length = a.asm.Ua).apply(null, arguments);
      };
      a._olm_pk_signing_key_from_seed = function () {
        return (a._olm_pk_signing_key_from_seed = a.asm.Va).apply(null, arguments);
      };
      a._olm_pk_signature_length = function () {
        return (a._olm_pk_signature_length = a.asm.Wa).apply(null, arguments);
      };
      a._olm_pk_sign = function () {
        return (a._olm_pk_sign = a.asm.Xa).apply(null, arguments);
      };
      a._olm_inbound_group_session_size = function () {
        return (a._olm_inbound_group_session_size = a.asm.Ya).apply(null, arguments);
      };
      a._olm_inbound_group_session = function () {
        return (a._olm_inbound_group_session = a.asm.Za).apply(null, arguments);
      };
      a._olm_clear_inbound_group_session = function () {
        return (a._olm_clear_inbound_group_session = a.asm._a).apply(null, arguments);
      };
      a._olm_inbound_group_session_last_error = function () {
        return (a._olm_inbound_group_session_last_error = a.asm.$a).apply(null, arguments);
      };
      a._olm_inbound_group_session_last_error_code = function () {
        return (a._olm_inbound_group_session_last_error_code = a.asm.ab).apply(null, arguments);
      };
      a._olm_init_inbound_group_session = function () {
        return (a._olm_init_inbound_group_session = a.asm.bb).apply(null, arguments);
      };
      a._olm_import_inbound_group_session = function () {
        return (a._olm_import_inbound_group_session = a.asm.cb).apply(null, arguments);
      };
      a._olm_pickle_inbound_group_session_length = function () {
        return (a._olm_pickle_inbound_group_session_length = a.asm.db).apply(null, arguments);
      };
      a._olm_pickle_inbound_group_session = function () {
        return (a._olm_pickle_inbound_group_session = a.asm.eb).apply(null, arguments);
      };
      a._olm_unpickle_inbound_group_session = function () {
        return (a._olm_unpickle_inbound_group_session = a.asm.fb).apply(null, arguments);
      };
      a._olm_group_decrypt_max_plaintext_length = function () {
        return (a._olm_group_decrypt_max_plaintext_length = a.asm.gb).apply(null, arguments);
      };
      a._olm_group_decrypt = function () {
        return (a._olm_group_decrypt = a.asm.hb).apply(null, arguments);
      };
      a._olm_inbound_group_session_id_length = function () {
        return (a._olm_inbound_group_session_id_length = a.asm.ib).apply(null, arguments);
      };
      a._olm_inbound_group_session_id = function () {
        return (a._olm_inbound_group_session_id = a.asm.jb).apply(null, arguments);
      };
      a._olm_inbound_group_session_first_known_index = function () {
        return (a._olm_inbound_group_session_first_known_index = a.asm.kb).apply(null, arguments);
      };
      a._olm_inbound_group_session_is_verified = function () {
        return (a._olm_inbound_group_session_is_verified = a.asm.lb).apply(null, arguments);
      };
      a._olm_export_inbound_group_session_length = function () {
        return (a._olm_export_inbound_group_session_length = a.asm.mb).apply(null, arguments);
      };
      a._olm_export_inbound_group_session = function () {
        return (a._olm_export_inbound_group_session = a.asm.nb).apply(null, arguments);
      };
      a._olm_outbound_group_session_size = function () {
        return (a._olm_outbound_group_session_size = a.asm.ob).apply(null, arguments);
      };
      a._olm_outbound_group_session = function () {
        return (a._olm_outbound_group_session = a.asm.pb).apply(null, arguments);
      };
      a._olm_clear_outbound_group_session = function () {
        return (a._olm_clear_outbound_group_session = a.asm.qb).apply(null, arguments);
      };
      a._olm_outbound_group_session_last_error = function () {
        return (a._olm_outbound_group_session_last_error = a.asm.rb).apply(null, arguments);
      };
      a._olm_outbound_group_session_last_error_code = function () {
        return (a._olm_outbound_group_session_last_error_code = a.asm.sb).apply(null, arguments);
      };
      a._olm_pickle_outbound_group_session_length = function () {
        return (a._olm_pickle_outbound_group_session_length = a.asm.tb).apply(null, arguments);
      };
      a._olm_pickle_outbound_group_session = function () {
        return (a._olm_pickle_outbound_group_session = a.asm.ub).apply(null, arguments);
      };
      a._olm_unpickle_outbound_group_session = function () {
        return (a._olm_unpickle_outbound_group_session = a.asm.vb).apply(null, arguments);
      };
      a._olm_init_outbound_group_session_random_length = function () {
        return (a._olm_init_outbound_group_session_random_length = a.asm.wb).apply(null, arguments);
      };
      a._olm_init_outbound_group_session = function () {
        return (a._olm_init_outbound_group_session = a.asm.xb).apply(null, arguments);
      };
      a._olm_group_encrypt_message_length = function () {
        return (a._olm_group_encrypt_message_length = a.asm.yb).apply(null, arguments);
      };
      a._olm_group_encrypt = function () {
        return (a._olm_group_encrypt = a.asm.zb).apply(null, arguments);
      };
      a._olm_outbound_group_session_id_length = function () {
        return (a._olm_outbound_group_session_id_length = a.asm.Ab).apply(null, arguments);
      };
      a._olm_outbound_group_session_id = function () {
        return (a._olm_outbound_group_session_id = a.asm.Bb).apply(null, arguments);
      };
      a._olm_outbound_group_session_message_index = function () {
        return (a._olm_outbound_group_session_message_index = a.asm.Cb).apply(null, arguments);
      };
      a._olm_outbound_group_session_key_length = function () {
        return (a._olm_outbound_group_session_key_length = a.asm.Db).apply(null, arguments);
      };
      a._olm_outbound_group_session_key = function () {
        return (a._olm_outbound_group_session_key = a.asm.Eb).apply(null, arguments);
      };
      a._olm_sas_last_error = function () {
        return (a._olm_sas_last_error = a.asm.Fb).apply(null, arguments);
      };
      a._olm_sas_last_error_code = function () {
        return (a._olm_sas_last_error_code = a.asm.Gb).apply(null, arguments);
      };
      a._olm_sas_size = function () {
        return (a._olm_sas_size = a.asm.Hb).apply(null, arguments);
      };
      a._olm_sas = function () {
        return (a._olm_sas = a.asm.Ib).apply(null, arguments);
      };
      a._olm_clear_sas = function () {
        return (a._olm_clear_sas = a.asm.Jb).apply(null, arguments);
      };
      a._olm_create_sas_random_length = function () {
        return (a._olm_create_sas_random_length = a.asm.Kb).apply(null, arguments);
      };
      a._olm_create_sas = function () {
        return (a._olm_create_sas = a.asm.Lb).apply(null, arguments);
      };
      a._olm_sas_pubkey_length = function () {
        return (a._olm_sas_pubkey_length = a.asm.Mb).apply(null, arguments);
      };
      a._olm_sas_get_pubkey = function () {
        return (a._olm_sas_get_pubkey = a.asm.Nb).apply(null, arguments);
      };
      a._olm_sas_set_their_key = function () {
        return (a._olm_sas_set_their_key = a.asm.Ob).apply(null, arguments);
      };
      a._olm_sas_is_their_key_set = function () {
        return (a._olm_sas_is_their_key_set = a.asm.Pb).apply(null, arguments);
      };
      a._olm_sas_generate_bytes = function () {
        return (a._olm_sas_generate_bytes = a.asm.Qb).apply(null, arguments);
      };
      a._olm_sas_mac_length = function () {
        return (a._olm_sas_mac_length = a.asm.Rb).apply(null, arguments);
      };
      a._olm_sas_calculate_mac_fixed_base64 = function () {
        return (a._olm_sas_calculate_mac_fixed_base64 = a.asm.Sb).apply(null, arguments);
      };
      a._olm_sas_calculate_mac = function () {
        return (a._olm_sas_calculate_mac = a.asm.Tb).apply(null, arguments);
      };
      a._olm_sas_calculate_mac_long_kdf = function () {
        return (a._olm_sas_calculate_mac_long_kdf = a.asm.Ub).apply(null, arguments);
      };
      a._malloc = function () {
        return (a._malloc = a.asm.Vb).apply(null, arguments);
      };
      a._free = function () {
        return (a._free = a.asm.Wb).apply(null, arguments);
      };
      var Oa = (a.stackSave = function () {
          return (Oa = a.stackSave = a.asm.Xb).apply(null, arguments);
        }),
        Pa = (a.stackRestore = function () {
          return (Pa = a.stackRestore = a.asm.Yb).apply(null, arguments);
        }),
        Qa = (a.stackAlloc = function () {
          return (Qa = a.stackAlloc = a.asm.Zb).apply(null, arguments);
        });
      a.UTF8ToString = t;
      a.stringToUTF8 = v;
      a.intArrayFromString = Ma;
      a.writeAsciiToMemory = La;
      a.ALLOC_STACK = 1;
      var Ra;
      B = function Sa() {
        Ra || Ta();
        Ra || (B = Sa);
      };
      function Ta() {
        function b() {
          if (!Ra && ((Ra = !0), (a.calledRun = !0), !pa)) {
            Ja(Aa);
            aa(a);
            if (a.onRuntimeInitialized) a.onRuntimeInitialized();
            if (a.postRun)
              for ('function' == typeof a.postRun && (a.postRun = [a.postRun]); a.postRun.length; ) {
                var c = a.postRun.shift();
                Ba.unshift(c);
              }
            Ja(Ba);
          }
        }
        if (!(0 < A)) {
          if (a.preRun) for ('function' == typeof a.preRun && (a.preRun = [a.preRun]); a.preRun.length; ) Ca();
          Ja(za);
          0 < A ||
            (a.setStatus
              ? (a.setStatus('Running...'),
                setTimeout(function () {
                  setTimeout(function () {
                    a.setStatus('');
                  }, 1);
                  b();
                }, 1))
              : b());
        }
      }
      if (a.preInit)
        for ('function' == typeof a.preInit && (a.preInit = [a.preInit]); 0 < a.preInit.length; ) a.preInit.pop()();
      Ta();
      function E() {
        var b = a._olm_outbound_group_session_size();
        this.ac = F(b);
        this.$b = a._olm_outbound_group_session(this.ac);
      }
      function G(b) {
        return function () {
          var c = b.apply(this, arguments);
          if (c === h) throw ((c = t(a._olm_outbound_group_session_last_error(arguments[0]))), Error('OLM.' + c));
          return c;
        };
      }
      E.prototype.free = function () {
        a._olm_clear_outbound_group_session(this.$b);
        H(this.$b);
      };
      E.prototype.pickle = J(function (b) {
        b = K(b);
        var c = G(a._olm_pickle_outbound_group_session_length)(this.$b),
          d = L(b),
          e = L(c + 1);
        try {
          G(a._olm_pickle_outbound_group_session)(this.$b, d, b.length, e, c);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
        return t(e, c);
      });
      E.prototype.unpickle = J(function (b, c) {
        b = K(b);
        var d = L(b);
        c = K(c);
        var e = L(c);
        try {
          G(a._olm_unpickle_outbound_group_session)(this.$b, d, b.length, e, c.length);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
      });
      E.prototype.create = J(function () {
        var b = G(a._olm_init_outbound_group_session_random_length)(this.$b),
          c = N(b, g);
        try {
          G(a._olm_init_outbound_group_session)(this.$b, c, b);
        } finally {
          M(c, b);
        }
      });
      E.prototype.encrypt = function (b) {
        try {
          var c = x(b);
          var d = G(a._olm_group_encrypt_message_length)(this.$b, c);
          var e = F(c + 1);
          v(b, e, c + 1);
          var f = F(d + 1);
          G(a._olm_group_encrypt)(this.$b, e, c, f, d);
          D(f + d);
          return t(f, d);
        } finally {
          void 0 !== e && (M(e, c + 1), H(e)), void 0 !== f && H(f);
        }
      };
      E.prototype.session_id = J(function () {
        var b = G(a._olm_outbound_group_session_id_length)(this.$b),
          c = L(b + 1);
        G(a._olm_outbound_group_session_id)(this.$b, c, b);
        return t(c, b);
      });
      E.prototype.session_key = J(function () {
        var b = G(a._olm_outbound_group_session_key_length)(this.$b),
          c = L(b + 1);
        G(a._olm_outbound_group_session_key)(this.$b, c, b);
        var d = t(c, b);
        M(c, b);
        return d;
      });
      E.prototype.message_index = function () {
        return G(a._olm_outbound_group_session_message_index)(this.$b);
      };
      olm_exports.OutboundGroupSession = E;
      function O() {
        var b = a._olm_inbound_group_session_size();
        this.ac = F(b);
        this.$b = a._olm_inbound_group_session(this.ac);
      }
      function P(b) {
        return function () {
          var c = b.apply(this, arguments);
          if (c === h) throw ((c = t(a._olm_inbound_group_session_last_error(arguments[0]))), Error('OLM.' + c));
          return c;
        };
      }
      O.prototype.free = function () {
        a._olm_clear_inbound_group_session(this.$b);
        H(this.$b);
      };
      O.prototype.pickle = J(function (b) {
        b = K(b);
        var c = P(a._olm_pickle_inbound_group_session_length)(this.$b),
          d = L(b),
          e = L(c + 1);
        try {
          P(a._olm_pickle_inbound_group_session)(this.$b, d, b.length, e, c);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
        return t(e, c);
      });
      O.prototype.unpickle = J(function (b, c) {
        b = K(b);
        var d = L(b);
        c = K(c);
        var e = L(c);
        try {
          P(a._olm_unpickle_inbound_group_session)(this.$b, d, b.length, e, c.length);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
      });
      O.prototype.create = J(function (b) {
        b = K(b);
        var c = L(b);
        try {
          P(a._olm_init_inbound_group_session)(this.$b, c, b.length);
        } finally {
          for (M(c, b.length), c = 0; c < b.length; c++) b[c] = 0;
        }
      });
      O.prototype.import_session = J(function (b) {
        b = K(b);
        var c = L(b);
        try {
          P(a._olm_import_inbound_group_session)(this.$b, c, b.length);
        } finally {
          for (M(c, b.length), c = 0; c < b.length; c++) b[c] = 0;
        }
      });
      O.prototype.decrypt = J(function (b) {
        try {
          var c = F(b.length);
          La(b, c, !0);
          var d = P(a._olm_group_decrypt_max_plaintext_length)(this.$b, c, b.length);
          La(b, c, !0);
          var e = F(d + 1);
          var f = L(4);
          var k = P(a._olm_group_decrypt)(this.$b, c, b.length, e, d, f);
          D(e + k);
          return { plaintext: t(e, k), message_index: Ka(f, 'i32') };
        } finally {
          void 0 !== c && H(c), void 0 !== e && (M(e, k), H(e));
        }
      });
      O.prototype.session_id = J(function () {
        var b = P(a._olm_inbound_group_session_id_length)(this.$b),
          c = L(b + 1);
        P(a._olm_inbound_group_session_id)(this.$b, c, b);
        return t(c, b);
      });
      O.prototype.first_known_index = J(function () {
        return P(a._olm_inbound_group_session_first_known_index)(this.$b);
      });
      O.prototype.export_session = J(function (b) {
        var c = P(a._olm_export_inbound_group_session_length)(this.$b),
          d = L(c + 1);
        G(a._olm_export_inbound_group_session)(this.$b, d, c, b);
        b = t(d, c);
        M(d, c);
        return b;
      });
      olm_exports.InboundGroupSession = O;
      function Ua() {
        var b = a._olm_pk_encryption_size();
        this.ac = F(b);
        this.$b = a._olm_pk_encryption(this.ac);
      }
      function R(b) {
        return function () {
          var c = b.apply(this, arguments);
          if (c === h) throw ((c = t(a._olm_pk_encryption_last_error(arguments[0]))), Error('OLM.' + c));
          return c;
        };
      }
      Ua.prototype.free = function () {
        a._olm_clear_pk_encryption(this.$b);
        H(this.$b);
      };
      Ua.prototype.set_recipient_key = J(function (b) {
        b = K(b);
        var c = L(b);
        R(a._olm_pk_encryption_set_recipient_key)(this.$b, c, b.length);
      });
      Ua.prototype.encrypt = J(function (b) {
        try {
          var c = x(b);
          var d = F(c + 1);
          v(b, d, c + 1);
          var e = R(a._olm_pk_encrypt_random_length)();
          var f = N(e, g);
          var k = R(a._olm_pk_ciphertext_length)(this.$b, c);
          var p = F(k + 1);
          var w = R(a._olm_pk_mac_length)(this.$b),
            ba = L(w + 1);
          D(ba + w);
          var Q = R(a._olm_pk_key_length)(),
            I = L(Q + 1);
          D(I + Q);
          R(a._olm_pk_encrypt)(this.$b, d, c, p, k, ba, w, I, Q, f, e);
          D(p + k);
          return { ciphertext: t(p, k), mac: t(ba, w), ephemeral: t(I, Q) };
        } finally {
          void 0 !== f && M(f, e), void 0 !== d && (M(d, c + 1), H(d)), void 0 !== p && H(p);
        }
      });
      function S() {
        var b = a._olm_pk_decryption_size();
        this.ac = F(b);
        this.$b = a._olm_pk_decryption(this.ac);
      }
      function T(b) {
        return function () {
          var c = b.apply(this, arguments);
          if (c === h) throw ((c = t(a._olm_pk_decryption_last_error(arguments[0]))), Error('OLM.' + c));
          return c;
        };
      }
      S.prototype.free = function () {
        a._olm_clear_pk_decryption(this.$b);
        H(this.$b);
      };
      S.prototype.init_with_private_key = J(function (b) {
        var c = L(b.length);
        a.HEAPU8.set(b, c);
        var d = T(a._olm_pk_key_length)(),
          e = L(d + 1);
        try {
          T(a._olm_pk_key_from_private)(this.$b, e, d, c, b.length);
        } finally {
          M(c, b.length);
        }
        return t(e, d);
      });
      S.prototype.generate_key = J(function () {
        var b = T(a._olm_pk_private_key_length)(),
          c = N(b, g),
          d = T(a._olm_pk_key_length)(),
          e = L(d + 1);
        try {
          T(a._olm_pk_key_from_private)(this.$b, e, d, c, b);
        } finally {
          M(c, b);
        }
        return t(e, d);
      });
      S.prototype.get_private_key = J(function () {
        var b = R(a._olm_pk_private_key_length)(),
          c = L(b);
        T(a._olm_pk_get_private_key)(this.$b, c, b);
        var d = new Uint8Array(new Uint8Array(a.HEAPU8.buffer, c, b));
        M(c, b);
        return d;
      });
      S.prototype.pickle = J(function (b) {
        b = K(b);
        var c = T(a._olm_pickle_pk_decryption_length)(this.$b),
          d = L(b),
          e = L(c + 1);
        try {
          T(a._olm_pickle_pk_decryption)(this.$b, d, b.length, e, c);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
        return t(e, c);
      });
      S.prototype.unpickle = J(function (b, c) {
        b = K(b);
        var d = L(b),
          e = K(c),
          f = L(e);
        c = T(a._olm_pk_key_length)();
        var k = L(c + 1);
        try {
          T(a._olm_unpickle_pk_decryption)(this.$b, d, b.length, f, e.length, k, c);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
        return t(k, c);
      });
      S.prototype.decrypt = J(function (b, c, d) {
        try {
          var e = x(d);
          var f = F(e + 1);
          v(d, f, e + 1);
          var k = K(b),
            p = L(k),
            w = K(c),
            ba = L(w);
          var Q = T(a._olm_pk_max_plaintext_length)(this.$b, e);
          var I = F(Q + 1);
          var ya = T(a._olm_pk_decrypt)(this.$b, p, k.length, ba, w.length, f, e, I, Q);
          D(I + ya);
          return t(I, ya);
        } finally {
          void 0 !== I && (M(I, ya + 1), H(I)), void 0 !== f && H(f);
        }
      });
      function Va() {
        var b = a._olm_pk_signing_size();
        this.ac = F(b);
        this.$b = a._olm_pk_signing(this.ac);
      }
      function Wa(b) {
        return function () {
          var c = b.apply(this, arguments);
          if (c === h) throw ((c = t(a._olm_pk_signing_last_error(arguments[0]))), Error('OLM.' + c));
          return c;
        };
      }
      Va.prototype.free = function () {
        a._olm_clear_pk_signing(this.$b);
        H(this.$b);
      };
      Va.prototype.init_with_seed = J(function (b) {
        var c = L(b.length);
        a.HEAPU8.set(b, c);
        var d = Wa(a._olm_pk_signing_public_key_length)(),
          e = L(d + 1);
        try {
          Wa(a._olm_pk_signing_key_from_seed)(this.$b, e, d, c, b.length);
        } finally {
          M(c, b.length);
        }
        return t(e, d);
      });
      Va.prototype.generate_seed = J(function () {
        var b = Wa(a._olm_pk_signing_seed_length)(),
          c = N(b, g),
          d = new Uint8Array(new Uint8Array(a.HEAPU8.buffer, c, b));
        M(c, b);
        return d;
      });
      Va.prototype.sign = J(function (b) {
        try {
          var c = x(b);
          var d = F(c + 1);
          v(b, d, c + 1);
          var e = Wa(a._olm_pk_signature_length)(),
            f = L(e + 1);
          Wa(a._olm_pk_sign)(this.$b, d, c, f, e);
          return t(f, e);
        } finally {
          void 0 !== d && (M(d, c + 1), H(d));
        }
      });
      function U() {
        var b = a._olm_sas_size(),
          c = a._olm_create_sas_random_length(),
          d = N(c, g);
        this.ac = F(b);
        this.$b = a._olm_sas(this.ac);
        a._olm_create_sas(this.$b, d, c);
        M(d, c);
      }
      function V(b) {
        return function () {
          var c = b.apply(this, arguments);
          if (c === h) throw ((c = t(a._olm_sas_last_error(arguments[0]))), Error('OLM.' + c));
          return c;
        };
      }
      U.prototype.free = function () {
        a._olm_clear_sas(this.$b);
        H(this.$b);
      };
      U.prototype.get_pubkey = J(function () {
        var b = V(a._olm_sas_pubkey_length)(this.$b),
          c = L(b + 1);
        V(a._olm_sas_get_pubkey)(this.$b, c, b);
        return t(c, b);
      });
      U.prototype.set_their_key = J(function (b) {
        b = K(b);
        var c = L(b);
        V(a._olm_sas_set_their_key)(this.$b, c, b.length);
      });
      U.prototype.is_their_key_set = J(function () {
        return V(a._olm_sas_is_their_key_set)(this.$b) ? !0 : !1;
      });
      U.prototype.generate_bytes = J(function (b, c) {
        b = K(b);
        var d = L(b),
          e = L(c);
        V(a._olm_sas_generate_bytes)(this.$b, d, b.length, e, c);
        return new Uint8Array(new Uint8Array(a.HEAPU8.buffer, e, c));
      });
      U.prototype.calculate_mac = J(function (b, c) {
        b = K(b);
        var d = L(b);
        c = K(c);
        var e = L(c),
          f = V(a._olm_sas_mac_length)(this.$b),
          k = L(f + 1);
        V(a._olm_sas_calculate_mac)(this.$b, d, b.length, e, c.length, k, f);
        return t(k, f);
      });
      U.prototype.calculate_mac_fixed_base64 = J(function (b, c) {
        b = K(b);
        var d = L(b);
        c = K(c);
        var e = L(c),
          f = V(a._olm_sas_mac_length)(this.$b),
          k = L(f + 1);
        V(a._olm_sas_calculate_mac_fixed_base64)(this.$b, d, b.length, e, c.length, k, f);
        return t(k, f);
      });
      U.prototype.calculate_mac_long_kdf = J(function (b, c) {
        b = K(b);
        var d = L(b);
        c = K(c);
        var e = L(c),
          f = V(a._olm_sas_mac_length)(this.$b),
          k = L(f + 1);
        V(a._olm_sas_calculate_mac_long_kdf)(this.$b, d, b.length, e, c.length, k, f);
        return t(k, f);
      });
      var F = a._malloc,
        H = a._free,
        h;
      function N(b, c) {
        var d = Qa(b);
        c(new Uint8Array(a.HEAPU8.buffer, d, b));
        return d;
      }
      function L(b) {
        return 'number' == typeof b
          ? N(b, function (c) {
              c.fill(0);
            })
          : N(b.length, function (c) {
              c.set(b);
            });
      }
      function K(b) {
        return b instanceof Uint8Array ? b : Ma(b, !0);
      }
      function J(b) {
        return function () {
          var c = Oa();
          try {
            return b.apply(this, arguments);
          } finally {
            Pa(c);
          }
        };
      }
      function M(b, c) {
        for (; 0 < c--; ) a.HEAP8[b++] = 0;
      }
      function W() {
        var b = a._olm_account_size();
        this.ac = F(b);
        this.$b = a._olm_account(this.ac);
      }
      function X(b) {
        return function () {
          var c = b.apply(this, arguments);
          if (c === h) throw ((c = t(a._olm_account_last_error(arguments[0]))), Error('OLM.' + c));
          return c;
        };
      }
      W.prototype.free = function () {
        a._olm_clear_account(this.$b);
        H(this.$b);
      };
      W.prototype.create = J(function () {
        var b = X(a._olm_create_account_random_length)(this.$b),
          c = N(b, g);
        try {
          X(a._olm_create_account)(this.$b, c, b);
        } finally {
          M(c, b);
        }
      });
      W.prototype.identity_keys = J(function () {
        var b = X(a._olm_account_identity_keys_length)(this.$b),
          c = L(b + 1);
        X(a._olm_account_identity_keys)(this.$b, c, b);
        return t(c, b);
      });
      W.prototype.sign = J(function (b) {
        var c = X(a._olm_account_signature_length)(this.$b);
        b = K(b);
        var d = L(b),
          e = L(c + 1);
        try {
          X(a._olm_account_sign)(this.$b, d, b.length, e, c);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
        return t(e, c);
      });
      W.prototype.one_time_keys = J(function () {
        var b = X(a._olm_account_one_time_keys_length)(this.$b),
          c = L(b + 1);
        X(a._olm_account_one_time_keys)(this.$b, c, b);
        return t(c, b);
      });
      W.prototype.mark_keys_as_published = J(function () {
        X(a._olm_account_mark_keys_as_published)(this.$b);
      });
      W.prototype.max_number_of_one_time_keys = J(function () {
        return X(a._olm_account_max_number_of_one_time_keys)(this.$b);
      });
      W.prototype.generate_one_time_keys = J(function (b) {
        var c = X(a._olm_account_generate_one_time_keys_random_length)(this.$b, b),
          d = N(c, g);
        try {
          X(a._olm_account_generate_one_time_keys)(this.$b, b, d, c);
        } finally {
          M(d, c);
        }
      });
      W.prototype.remove_one_time_keys = J(function (b) {
        X(a._olm_remove_one_time_keys)(this.$b, b.$b);
      });
      W.prototype.generate_fallback_key = J(function () {
        var b = X(a._olm_account_generate_fallback_key_random_length)(this.$b),
          c = N(b, g);
        try {
          X(a._olm_account_generate_fallback_key)(this.$b, c, b);
        } finally {
          M(c, b);
        }
      });
      W.prototype.fallback_key = J(function () {
        var b = X(a._olm_account_fallback_key_length)(this.$b),
          c = L(b + 1);
        X(a._olm_account_fallback_key)(this.$b, c, b);
        return t(c, b);
      });
      W.prototype.unpublished_fallback_key = J(function () {
        var b = X(a._olm_account_unpublished_fallback_key_length)(this.$b),
          c = L(b + 1);
        X(a._olm_account_unpublished_fallback_key)(this.$b, c, b);
        return t(c, b);
      });
      W.prototype.forget_old_fallback_key = J(function () {
        X(a._olm_account_forget_old_fallback_key)(this.$b);
      });
      W.prototype.pickle = J(function (b) {
        b = K(b);
        var c = X(a._olm_pickle_account_length)(this.$b),
          d = L(b),
          e = L(c + 1);
        try {
          X(a._olm_pickle_account)(this.$b, d, b.length, e, c);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
        return t(e, c);
      });
      W.prototype.unpickle = J(function (b, c) {
        b = K(b);
        var d = L(b);
        c = K(c);
        var e = L(c);
        try {
          X(a._olm_unpickle_account)(this.$b, d, b.length, e, c.length);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
      });
      function Y() {
        var b = a._olm_session_size();
        this.ac = F(b);
        this.$b = a._olm_session(this.ac);
      }
      function Z(b) {
        return function () {
          var c = b.apply(this, arguments);
          if (c === h) throw ((c = t(a._olm_session_last_error(arguments[0]))), Error('OLM.' + c));
          return c;
        };
      }
      Y.prototype.free = function () {
        a._olm_clear_session(this.$b);
        H(this.$b);
      };
      Y.prototype.pickle = J(function (b) {
        b = K(b);
        var c = Z(a._olm_pickle_session_length)(this.$b),
          d = L(b),
          e = L(c + 1);
        try {
          Z(a._olm_pickle_session)(this.$b, d, b.length, e, c);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
        return t(e, c);
      });
      Y.prototype.unpickle = J(function (b, c) {
        b = K(b);
        var d = L(b);
        c = K(c);
        var e = L(c);
        try {
          Z(a._olm_unpickle_session)(this.$b, d, b.length, e, c.length);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
      });
      Y.prototype.create_outbound = J(function (b, c, d) {
        var e = Z(a._olm_create_outbound_session_random_length)(this.$b),
          f = N(e, g);
        c = K(c);
        d = K(d);
        var k = L(c),
          p = L(d);
        try {
          Z(a._olm_create_outbound_session)(this.$b, b.$b, k, c.length, p, d.length, f, e);
        } finally {
          M(f, e);
        }
      });
      Y.prototype.create_inbound = J(function (b, c) {
        c = K(c);
        var d = L(c);
        try {
          Z(a._olm_create_inbound_session)(this.$b, b.$b, d, c.length);
        } finally {
          for (M(d, c.length), b = 0; b < c.length; b++) c[b] = 0;
        }
      });
      Y.prototype.create_inbound_from = J(function (b, c, d) {
        c = K(c);
        var e = L(c);
        d = K(d);
        var f = L(d);
        try {
          Z(a._olm_create_inbound_session_from)(this.$b, b.$b, e, c.length, f, d.length);
        } finally {
          for (M(f, d.length), b = 0; b < d.length; b++) d[b] = 0;
        }
      });
      Y.prototype.session_id = J(function () {
        var b = Z(a._olm_session_id_length)(this.$b),
          c = L(b + 1);
        Z(a._olm_session_id)(this.$b, c, b);
        return t(c, b);
      });
      Y.prototype.has_received_message = function () {
        return Z(a._olm_session_has_received_message)(this.$b) ? !0 : !1;
      };
      Y.prototype.matches_inbound = J(function (b) {
        b = K(b);
        var c = L(b);
        return Z(a._olm_matches_inbound_session)(this.$b, c, b.length) ? !0 : !1;
      });
      Y.prototype.matches_inbound_from = J(function (b, c) {
        b = K(b);
        var d = L(b);
        c = K(c);
        var e = L(c);
        return Z(a._olm_matches_inbound_session_from)(this.$b, d, b.length, e, c.length) ? !0 : !1;
      });
      Y.prototype.encrypt = J(function (b) {
        try {
          var c = Z(a._olm_encrypt_random_length)(this.$b);
          var d = Z(a._olm_encrypt_message_type)(this.$b);
          var e = x(b);
          var f = Z(a._olm_encrypt_message_length)(this.$b, e);
          var k = N(c, g);
          var p = F(e + 1);
          v(b, p, e + 1);
          var w = F(f + 1);
          Z(a._olm_encrypt)(this.$b, p, e, k, c, w, f);
          D(w + f);
          return { type: d, body: t(w, f) };
        } finally {
          void 0 !== k && M(k, c), void 0 !== p && (M(p, e + 1), H(p)), void 0 !== w && H(w);
        }
      });
      Y.prototype.decrypt = J(function (b, c) {
        try {
          var d = F(c.length);
          La(c, d, !0);
          var e = Z(a._olm_decrypt_max_plaintext_length)(this.$b, b, d, c.length);
          La(c, d, !0);
          var f = F(e + 1);
          var k = Z(a._olm_decrypt)(this.$b, b, d, c.length, f, e);
          D(f + k);
          return t(f, k);
        } finally {
          void 0 !== d && H(d), void 0 !== f && (M(f, e), H(f));
        }
      });
      Y.prototype.describe = J(function () {
        try {
          var b = F(256);
          Z(a._olm_session_describe)(this.$b, b, 256);
          return t(b);
        } finally {
          void 0 !== b && H(b);
        }
      });
      function Xa() {
        var b = a._olm_utility_size();
        this.ac = F(b);
        this.$b = a._olm_utility(this.ac);
      }
      function Ya(b) {
        return function () {
          var c = b.apply(this, arguments);
          if (c === h) throw ((c = t(a._olm_utility_last_error(arguments[0]))), Error('OLM.' + c));
          return c;
        };
      }
      Xa.prototype.free = function () {
        a._olm_clear_utility(this.$b);
        H(this.$b);
      };
      Xa.prototype.sha256 = J(function (b) {
        var c = Ya(a._olm_sha256_length)(this.$b);
        b = K(b);
        var d = L(b),
          e = L(c + 1);
        try {
          Ya(a._olm_sha256)(this.$b, d, b.length, e, c);
        } finally {
          for (M(d, b.length), d = 0; d < b.length; d++) b[d] = 0;
        }
        return t(e, c);
      });
      Xa.prototype.ed25519_verify = J(function (b, c, d) {
        b = K(b);
        var e = L(b);
        c = K(c);
        var f = L(c);
        d = K(d);
        var k = L(d);
        try {
          Ya(a._olm_ed25519_verify)(this.$b, e, b.length, f, c.length, k, d.length);
        } finally {
          for (M(f, c.length), b = 0; b < c.length; b++) c[b] = 0;
        }
      });
      olm_exports.Account = W;
      olm_exports.Session = Y;
      olm_exports.Utility = Xa;
      olm_exports.PkEncryption = Ua;
      olm_exports.PkDecryption = S;
      olm_exports.PkSigning = Va;
      olm_exports.SAS = U;
      olm_exports.get_library_version = J(function () {
        var b = L(3);
        a._olm_get_library_version(b, b + 1, b + 2);
        return [Ka(b, 'i8'), Ka(b + 1, 'i8'), Ka(b + 2, 'i8')];
      });

      return Module.ready;
    };
  })();
  if (typeof exports === 'object' && typeof module === 'object') module.exports = Module;
  else if (typeof define === 'function' && define['amd'])
    define([], function () {
      return Module;
    });
  else if (typeof exports === 'object') exports['Module'] = Module;
  var olmInitPromise;

  olm_exports['init'] = function (opts) {
    if (olmInitPromise) return olmInitPromise;

    if (opts) OLM_OPTIONS = opts;

    olmInitPromise = new Promise(function (resolve, reject) {
      onInitSuccess = function () {
        resolve();
      };
      onInitFail = function (err) {
        reject(err);
      };
      Module();
    });
    return olmInitPromise;
  };

  return olm_exports;
})();

if (typeof window !== 'undefined') {
  // We've been imported directly into a browser. Define the global 'Olm' object.
  // (we do this even if module.exports was defined, because it's useful to have
  // Olm in the global scope for browserified and webpacked apps.)
  window['Olm'] = Olm;
}

if (typeof module === 'object') {
  // Emscripten sets the module exports to be its module
  // with wrapped c functions. Clobber it with our higher
  // level wrapper class.
  module.exports = Olm;
}

// @license-end
