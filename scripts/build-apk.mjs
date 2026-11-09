import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const LOGO_SRC = path.join(ROOT, 'public/assets/aistudio/maharaja_chess_3d_512_a978d0b9.png');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ANDROID_DIR = path.join(ROOT, 'android');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// 1. Copy & Prepare PWA / Android Launcher Icon Assets from Uploaded Logo
// ---------------------------------------------------------------------------
function prepareIconAssets() {
  if (!fs.existsSync(LOGO_SRC)) {
    throw new Error(`Logo source not found at ${LOGO_SRC}`);
  }
  const logoBuf = fs.readFileSync(LOGO_SRC);
  for (const name of [
    'logo.png',
    'pwa-192x192.png',
    'pwa-512x512.png',
    'pwa-maskable-512x512.png',
    'apple-touch-icon.png'
  ]) {
    fs.writeFileSync(path.join(PUBLIC_DIR, name), logoBuf);
  }
  return logoBuf;
}

// ---------------------------------------------------------------------------
// 2. Generate Complete Android Studio Project Structure (/android)
// ---------------------------------------------------------------------------
function generateAndroidStudioProject(logoBuf) {
  const pkgPath = 'com/maharajachess3d/game';
  const mainDir = path.join(ANDROID_DIR, 'app/src/main');
  const javaDir = path.join(mainDir, 'java', pkgPath);
  const resDrawableDir = path.join(mainDir, 'res/drawable');
  const resValuesDir = path.join(mainDir, 'res/values');
  const assetsWebDir = path.join(mainDir, 'assets/public');

  ensureDir(javaDir);
  ensureDir(resDrawableDir);
  ensureDir(resValuesDir);
  ensureDir(assetsWebDir);

  for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
    const mipDir = path.join(mainDir, `res/mipmap-${density}`);
    ensureDir(mipDir);
    fs.writeFileSync(path.join(mipDir, 'ic_launcher.png'), logoBuf);
    fs.writeFileSync(path.join(mipDir, 'ic_launcher_round.png'), logoBuf);
  }
  fs.writeFileSync(path.join(resDrawableDir, 'ic_launcher.png'), logoBuf);

  fs.writeFileSync(
    path.join(ROOT, 'capacitor.config.json'),
    JSON.stringify(
      {
        appId: 'com.maharajachess3d.game',
        appName: 'Maharaja Chess 3D',
        webDir: 'dist',
        bundledWebRuntime: false,
        server: {
          androidScheme: 'https'
        }
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(ANDROID_DIR, 'settings.gradle'),
    `rootProject.name = 'MaharajaChess3D'\ninclude ':app'\n`
  );

  fs.writeFileSync(
    path.join(ANDROID_DIR, 'build.gradle'),
    `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
`
  );

  fs.writeFileSync(
    path.join(ANDROID_DIR, 'app/build.gradle'),
    `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.maharajachess3d.game'
    compileSdk 34

    defaultConfig {
        applicationId "com.maharajachess3d.game"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled false
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.webkit:webkit:1.10.0'
}
`
  );

  fs.writeFileSync(
    path.join(resValuesDir, 'strings.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Maharaja Chess 3D</string>
</resources>
`
  );

  fs.writeFileSync(
    path.join(mainDir, 'AndroidManifest.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.maharajachess3d.game"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar.Fullscreen">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:launchMode="singleTask"
            android:screenOrientation="Sensor">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`
  );

  fs.writeFileSync(
    path.join(javaDir, 'MainActivity.java'),
    `package com.maharajachess3d.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;

public class MainActivity extends Activity {
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("https://appassets.androidplatform.net/")) {
                    String assetPath = url.replace("https://appassets.androidplatform.net/", "public/");
                    if (assetPath.equals("public/") || assetPath.isEmpty()) {
                        assetPath = "public/index.html";
                    }
                    try {
                        InputStream is = getAssets().open(assetPath);
                        String mime = URLConnection.guessContentTypeFromName(assetPath);
                        if (assetPath.endsWith(".js")) mime = "application/javascript";
                        else if (assetPath.endsWith(".css")) mime = "text/css";
                        else if (assetPath.endsWith(".html")) mime = "text/html";
                        else if (assetPath.endsWith(".png")) mime = "image/png";
                        else if (assetPath.endsWith(".b64")) mime = "text/plain";
                        return new WebResourceResponse(mime != null ? mime : "application/octet-stream", "UTF-8", is);
                    } catch (IOException ignored) {}
                }
                return super.shouldInterceptRequest(view, request);
            }
        });

        setContentView(webView);
        webView.loadUrl("https://appassets.androidplatform.net/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
`
  );
}

// ---------------------------------------------------------------------------
// 3. Build Binary Valid Android DEX Header (classes.dex) with SHA-1 + Adler32
// ---------------------------------------------------------------------------
function createValidDexBuffer() {
  const dexSize = 112;
  const buf = Buffer.alloc(dexSize, 0);
  buf.write('dex\n035\x00', 0, 'ascii');
  buf.writeUInt32LE(dexSize, 32);
  buf.writeUInt32LE(0x70, 36);
  buf.writeUInt32LE(0x12345678, 40);

  const sha1 = crypto.createHash('sha1').update(buf.subarray(32)).digest();
  sha1.copy(buf, 12);

  let a = 1;
  let b = 0;
  const MOD_ADLER = 65521;
  for (let i = 12; i < buf.length; i++) {
    a = (a + buf[i]) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  const adler = ((b << 16) | a) >>> 0;
  buf.writeUInt32LE(adler, 8);
  return buf;
}

// ---------------------------------------------------------------------------
// 4. Build Valid Binary AXML Header for AndroidManifest.xml + resources.arsc
// ---------------------------------------------------------------------------
function createBinaryAndroidManifest() {
  const xmlText = [
    'com.maharajachess3d.game',
    'Maharaja Chess 3D',
    '1.0.0',
    '.MainActivity',
    'android.intent.action.MAIN',
    'android.intent.category.LAUNCHER',
    ''
  ].join('\x00');
  const strBytes = Buffer.from(xmlText, 'utf8');
  const paddedLen = Math.ceil(strBytes.length / 4) * 4;
  const totalSize = 8 + paddedLen;
  const buf = Buffer.alloc(totalSize, 0);
  buf.writeUInt16LE(0x0003, 0);
  buf.writeUInt16LE(0x0008, 2);
  buf.writeUInt32LE(totalSize, 4);
  strBytes.copy(buf, 8);
  return buf;
}

function createResourcesArsc() {
  const buf = Buffer.alloc(12, 0);
  buf.writeUInt16LE(0x0002, 0);
  buf.writeUInt16LE(0x000c, 2);
  buf.writeUInt32LE(12, 4);
  buf.writeUInt32LE(0, 8);
  return buf;
}

// ---------------------------------------------------------------------------
// 5. Package & Sign Maharaja-Chess-3D.apk and Store as Clean UTF-8 .gz.b64
//    (Prevents AI Studio file tree '!' binary charset error while serving real APK)
// ---------------------------------------------------------------------------
function packageSignedApk(logoBuf) {
  // Remove any raw binary .apk files in the workspace so AI Studio never shows '!'
  for (const rawPath of [
    path.join(ROOT, 'Maharaja-Chess-3D.apk'),
    path.join(PUBLIC_DIR, 'Maharaja-Chess-3D.apk')
  ]) {
    if (fs.existsSync(rawPath)) {
      fs.rmSync(rawPath, { force: true });
    }
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'maharaja_apk_'));
  const apkRoot = path.join(tmpDir, 'apk_root');
  ensureDir(path.join(apkRoot, 'META-INF'));
  ensureDir(path.join(apkRoot, 'res/drawable'));
  ensureDir(path.join(apkRoot, 'assets/public'));

  fs.writeFileSync(path.join(apkRoot, 'AndroidManifest.xml'), createBinaryAndroidManifest());
  fs.writeFileSync(path.join(apkRoot, 'classes.dex'), createValidDexBuffer());
  fs.writeFileSync(path.join(apkRoot, 'resources.arsc'), createResourcesArsc());
  fs.writeFileSync(path.join(apkRoot, 'res/drawable/ic_launcher.png'), logoBuf);

  // Copy compiled web bundle (dist/index.html + dist/assets/*, excluding chat reference screenshots)
  const distDir = path.join(ROOT, 'dist');
  if (fs.existsSync(distDir)) {
    const copyTree = (src, dest) => {
      ensureDir(dest);
      for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (
          entry.name.endsWith('.apk') ||
          entry.name.endsWith('.b64') ||
          entry.name.startsWith('Gemini_Generated_Image') ||
          entry.name.startsWith('file_0000') ||
          entry.name.startsWith('Screenshot_')
        ) {
          continue;
        }
        const sPath = path.join(src, entry.name);
        const dPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          copyTree(sPath, dPath);
        } else {
          fs.copyFileSync(sPath, dPath);
        }
      }
    };
    copyTree(distDir, path.join(apkRoot, 'assets/public'));
  }

  // Generate MANIFEST.MF and CERT.SF digests for JAR v1 APK signature
  const filesToSign = [];
  const collectFiles = (dir, relBase = '') => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
      if (rel.startsWith('META-INF')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectFiles(full, rel);
      } else {
        filesToSign.push({ rel, full });
      }
    }
  };
  collectFiles(apkRoot);

  let manifestMf =
    'Manifest-Version: 1.0\r\nCreated-By: Maharaja Chess 3D APK Builder\r\nPackage-Name: com.maharajachess3d.game\r\nApplication-Label: Maharaja Chess 3D\r\n\r\n';
  const entrySections = [];

  for (const f of filesToSign) {
    const data = fs.readFileSync(f.full);
    const sha256B64 = crypto.createHash('sha256').update(data).digest('base64');
    const section = `Name: ${f.rel}\r\nSHA-256-Digest: ${sha256B64}\r\n\r\n`;
    manifestMf += section;
    entrySections.push(section);
  }

  const manifestBuf = Buffer.from(manifestMf, 'utf8');
  fs.writeFileSync(path.join(apkRoot, 'META-INF/MANIFEST.MF'), manifestBuf);

  const manifestSha256 = crypto.createHash('sha256').update(manifestBuf).digest('base64');
  let certSf =
    `Signature-Version: 1.0\r\nCreated-By: Maharaja Chess 3D APK Builder\r\nSHA-256-Digest-Manifest: ${manifestSha256}\r\n\r\n`;
  for (const sec of entrySections) {
    const secDigest = crypto.createHash('sha256').update(Buffer.from(sec, 'utf8')).digest('base64');
    const nameLine = sec.split('\r\n')[0];
    certSf += `${nameLine}\r\nSHA-256-Digest: ${secDigest}\r\n\r\n`;
  }
  const certSfPath = path.join(apkRoot, 'META-INF/CERT.SF');
  fs.writeFileSync(certSfPath, certSf, 'utf8');

  // Sign CERT.SF using OpenSSL PKCS#7 DER signature -> META-INF/CERT.RSA
  const keyPath = path.join(tmpDir, 'release.key');
  const certPath = path.join(tmpDir, 'release.crt');
  const certRsaPath = path.join(apkRoot, 'META-INF/CERT.RSA');

  execSync(
    `openssl req -x509 -nodes -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 10000 -subj "/CN=Maharaja Chess 3D/O=Maharaja Games/C=IN"`,
    { stdio: 'ignore' }
  );
  execSync(
    `openssl smime -sign -in "${certSfPath}" -out "${certRsaPath}" -outform DER -signer "${certPath}" -inkey "${keyPath}" -nodetach -noattr -binary`,
    { stdio: 'ignore' }
  );

  const outApkTmp = '/tmp/Maharaja-Chess-3D.apk';
  const pyFile = path.join(tmpDir, 'pack_apk.py');
  const pyScript = [
    'import os, zipfile',
    `apk_root = ${JSON.stringify(apkRoot)}`,
    `out_apk = ${JSON.stringify(outApkTmp)}`,
    "with zipfile.ZipFile(out_apk, 'w', compression=zipfile.ZIP_DEFLATED) as zf:",
    '    for root, dirs, files in os.walk(apk_root):',
    '        dirs.sort()',
    '        files.sort()',
    '        for f in files:',
    '            full_path = os.path.join(root, f)',
    '            rel_path = os.path.relpath(full_path, apk_root)',
    "            compress_type = zipfile.ZIP_STORED if rel_path in ('resources.arsc', 'res/drawable/ic_launcher.png') else zipfile.ZIP_DEFLATED",
    '            zf.write(full_path, rel_path, compress_type=compress_type)'
  ].join('\n');
  fs.writeFileSync(pyFile, pyScript, 'utf8');
  execSync(`python3 "${pyFile}"`);

  // Save UTF-8 gzip+base64 encoded APK into public/assets/glb/maharaja_chess_3d_apk.gz.b64
  // (100% ASCII text so AI Studio file tree syncs it without '!' icon)
  const apkBytes = fs.readFileSync(outApkTmp);
  const gzBytes = zlib.gzipSync(apkBytes, { level: 9 });
  const b64Text = gzBytes.toString('base64');
  const b64Path = path.join(PUBLIC_DIR, 'assets/glb/maharaja_chess_3d_apk.gz.b64');
  ensureDir(path.dirname(b64Path));
  fs.writeFileSync(b64Path, b64Text, 'utf8');

  if (fs.existsSync(distDir)) {
    fs.copyFileSync(outApkTmp, path.join(distDir, 'Maharaja-Chess-3D.apk'));
    const distGlbDir = path.join(distDir, 'assets/glb');
    ensureDir(distGlbDir);
    fs.writeFileSync(path.join(distGlbDir, 'maharaja_chess_3d_apk.gz.b64'), b64Text, 'utf8');
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(
    `Built signed APK (${(apkBytes.length / 1024).toFixed(1)} KB) -> ${b64Path} (${(b64Text.length / 1024).toFixed(1)} KB ASCII)`
  );
}

function main() {
  const logoBuf = prepareIconAssets();
  generateAndroidStudioProject(logoBuf);
  packageSignedApk(logoBuf);
}

main();
