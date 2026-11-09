import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();

test('Simplified Single-Player HUD in src/App.tsx excludes speed sliders, notation script bar, and multiplayer lobby', () => {
  const appTsx = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf-8');

  // Must include simplified game controls
  for (const requiredId of [
    'btn-side-toggle',
    'btn-ai-move',
    'btn-reset',
    'btn-hide-ui',
    'controls-hint',
    'captured-tray'
  ]) {
    assert.ok(appTsx.includes(`id="${requiredId}"`), `Missing required HUD control #${requiredId}`);
  }

  // Must NOT include camera angle buttons, camera speed sliders, script mode bar, or multiplayer lobby
  for (const forbiddenId of [
    'btn-cam-player',
    'btn-cam-top',
    'btn-cam-side',
    'btn-cam-wide',
    'cam-speed-wrap',
    'input-cam-speed',
    'rot-speed-wrap',
    'input-rot-speed',
    'script-bar',
    'btn-script-modal',
    'btn-script-prev',
    'btn-script-next',
    'btn-lobby',
    'lobby-modal',
    'room-pill',
    'btn-checkmate-stepback'
  ]) {
    assert.ok(!appTsx.includes(forbiddenId), `Forbidden UI element #${forbiddenId} found in App.tsx`);
  }
});

test('All 7 compressed 3D assets (.glb.gz.b64) decode and gunzip to valid glTF 2.0 binary models', () => {
  const expectedModels = [
    'option8_cathedral',
    'pawn_white',
    'rook_white',
    'knight_white',
    'bishop_white',
    'queen_white',
    'king_white'
  ];

  for (const name of expectedModels) {
    const b64Path = path.join(ROOT, 'public/assets/glb', `${name}.glb.gz.b64`);
    assert.ok(fs.existsSync(b64Path), `Missing 3D asset ${b64Path}`);
    const b64Text = fs.readFileSync(b64Path, 'utf-8').trim();
    assert.ok(b64Text.length > 1000, `Asset ${name}.glb.gz.b64 is unexpectedly small`);

    const gzBuf = Buffer.from(b64Text, 'base64');
    const glbBuf = zlib.gunzipSync(gzBuf);

    const magic = glbBuf.toString('ascii', 0, 4);
    const version = glbBuf.readUInt32LE(4);
    const totalLen = glbBuf.readUInt32LE(8);
    assert.equal(magic, 'glTF', `Invalid glTF magic header for ${name}`);
    assert.equal(version, 2, `Invalid glTF version for ${name}`);
    assert.equal(totalLen, glbBuf.length, `Mismatched glTF byte length for ${name}`);
  }
});

test('Maharaja Chess 3D branding, logo, Android Studio project, and signed APK package are valid', () => {
  const appTsx = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf-8');
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');

  assert.ok(appTsx.includes('MAHARAJA CHESS 3D'), 'Main menu should include MAHARAJA CHESS 3D title');
  assert.ok(appTsx.includes('Maharaja Chess 3D'), 'HUD should include Maharaja Chess 3D title');
  assert.ok(
    appTsx.includes('/assets/aistudio/maharaja_chess_3d_512_a978d0b9.png'),
    'App.tsx should display the Maharaja Chess 3D logo'
  );
  assert.ok(indexHtml.includes('Maharaja Chess 3D'), 'index.html title should be Maharaja Chess 3D');

  const apkB64Path = path.join(ROOT, 'public/assets/glb/maharaja_chess_3d_apk.gz.b64');
  assert.ok(fs.existsSync(apkB64Path), 'Encoded APK public/assets/glb/maharaja_chess_3d_apk.gz.b64 must exist');
  const b64Text = fs.readFileSync(apkB64Path, 'utf-8').trim();
  const apkBuf = zlib.gunzipSync(Buffer.from(b64Text, 'base64'));
  assert.equal(apkBuf.toString('ascii', 0, 2), 'PK', 'APK must be a valid ZIP/JAR archive starting with PK');
  assert.ok(apkBuf.length > 50000, 'APK should contain the bundled Maharaja Chess 3D assets and icon');
  assert.ok(!fs.existsSync(path.join(ROOT, 'Maharaja-Chess-3D.apk')), 'No raw binary .apk in root tree');
  assert.ok(!fs.existsSync(path.join(ROOT, 'public/Maharaja-Chess-3D.apk')), 'No raw binary .apk in public tree');

  const androidManifestPath = path.join(ROOT, 'android/app/src/main/AndroidManifest.xml');
  const mainActivityPath = path.join(
    ROOT,
    'android/app/src/main/java/com/maharajachess3d/game/MainActivity.java'
  );
  assert.ok(fs.existsSync(androidManifestPath), 'AndroidManifest.xml must exist in android/');
  assert.ok(fs.existsSync(mainActivityPath), 'MainActivity.java must exist in android/');
});

