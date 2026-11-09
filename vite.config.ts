import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function maharajaApkMiddlewarePlugin(): Plugin {
  let cachedApkBuf: Buffer | null = null;

  function getApkBuffer(): Buffer | null {
    if (cachedApkBuf && cachedApkBuf.length > 0) {
      return cachedApkBuf;
    }
    const tmpApk = '/tmp/Maharaja-Chess-3D.apk';
    if (fs.existsSync(tmpApk)) {
      cachedApkBuf = fs.readFileSync(tmpApk);
      return cachedApkBuf;
    }
    const b64Path = path.resolve('./public/assets/glb/maharaja_chess_3d_apk.gz.b64');
    if (fs.existsSync(b64Path)) {
      const b64Text = fs.readFileSync(b64Path, 'utf8').trim();
      const gzBuf = Buffer.from(b64Text, 'base64');
      cachedApkBuf = zlib.gunzipSync(gzBuf);
      return cachedApkBuf;
    }
    return null;
  }

  const handler = (req: any, res: any, next: any) => {
    const urlPath = (req.url || '').split('?')[0];
    if (urlPath === '/Maharaja-Chess-3D.apk' || urlPath === '/api/download-apk') {
      const apkBuf = getApkBuffer();
      if (apkBuf) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="Maharaja-Chess-3D.apk"');
        res.setHeader('Content-Length', String(apkBuf.length));
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'HEAD') {
          res.end();
        } else {
          res.end(apkBuf);
        }
        return;
      }
    }
    next();
  };

  return {
    name: 'maharaja-apk-download-middleware',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ mode }) => {
  loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), maharajaApkMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  };
});
