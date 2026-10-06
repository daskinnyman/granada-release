// A slowly turning wireframe globe for the hero, drawn in blueprint lines.
// If WebGL or the module fails, the SVG globe under it stays in place.
import * as THREE from "three";

const box = document.getElementById("globe");
const canvas = document.getElementById("globe-canvas");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  const LINE = 0x7cc8ff, HI = 0xcfe9ff, WARN = 0xffcf5a;
  const R = 1.6;
  const globe = new THREE.Group();
  globe.rotation.z = 0.41; // axial tilt
  scene.add(globe);
  const spin = new THREE.Group();
  globe.add(spin);

  // Graticule: latitude and longitude lines.
  const grat = [];
  for (let lat = -75; lat <= 75; lat += 15) {
    const phi = (lat * Math.PI) / 180;
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2, b = ((i + 1) / 96) * Math.PI * 2;
      const r = R * Math.cos(phi), y = R * Math.sin(phi);
      grat.push(r * Math.cos(a), y, r * Math.sin(a), r * Math.cos(b), y, r * Math.sin(b));
    }
  }
  for (let lon = 0; lon < 180; lon += 20) {
    const t = (lon * Math.PI) / 180;
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2, b = ((i + 1) / 96) * Math.PI * 2;
      grat.push(
        R * Math.cos(a) * Math.cos(t), R * Math.sin(a), R * Math.cos(a) * Math.sin(t),
        R * Math.cos(b) * Math.cos(t), R * Math.sin(b), R * Math.cos(b) * Math.sin(t)
      );
    }
  }
  const gg = new THREE.BufferGeometry();
  gg.setAttribute("position", new THREE.Float32BufferAttribute(grat, 3));
  spin.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: LINE, transparent: true, opacity: 0.28 })));

  // Land as dots: a fibonacci sphere masked by smooth noise.
  const hash = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
  const noise = (x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const f = (v) => v * v * (3 - 2 * v);
    const u = f(x - xi), v = f(y - yi), w = f(z - zi);
    const l = (a, b, t) => a + (b - a) * t;
    const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
    return l(l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v), l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v), w);
  };
  const dots = [];
  const N = 5200, golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    const x = Math.cos(th) * r, z = Math.sin(th) * r;
    const n = noise(x * 1.6 + 3, y * 1.6, z * 1.6) * 0.65 + noise(x * 4, y * 4 + 9, z * 4) * 0.35;
    if (n > 0.55 && Math.abs(y) < 0.92) dots.push(x * R * 1.003, y * R * 1.003, z * R * 1.003);
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute("position", new THREE.Float32BufferAttribute(dots, 3));
  spin.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: HI, size: 0.028, transparent: true, opacity: 0.85 })));

  // Solid core so back lines fade.
  const core = new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 48, 32), new THREE.MeshBasicMaterial({ color: 0x061528, transparent: true, opacity: 0.72 }));
  globe.add(core);

  // Limb ring, always facing the camera.
  const limbPts = [];
  for (let i = 0; i <= 128; i++) { const a = (i / 128) * Math.PI * 2; limbPts.push(new THREE.Vector3(Math.cos(a) * R * 1.01, Math.sin(a) * R * 1.01, 0)); }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(limbPts), new THREE.LineBasicMaterial({ color: HI, transparent: true, opacity: 0.7 })));

  // Orbit with a small marker.
  const orbit = new THREE.Group();
  orbit.rotation.x = 1.15;
  orbit.rotation.y = -0.35;
  scene.add(orbit);
  const op = [];
  for (let i = 0; i <= 160; i++) { const a = (i / 160) * Math.PI * 2; op.push(new THREE.Vector3(Math.cos(a) * R * 1.55, Math.sin(a) * R * 1.55, 0)); }
  const ol = new THREE.Line(new THREE.BufferGeometry().setFromPoints(op), new THREE.LineDashedMaterial({ color: LINE, dashSize: 0.06, gapSize: 0.08, transparent: true, opacity: 0.6 }));
  ol.computeLineDistances();
  orbit.add(ol);
  const sat = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), new THREE.MeshBasicMaterial({ color: WARN }));
  orbit.add(sat);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  let tx = 0, ty = 0, mx = 0, my = 0;
  window.addEventListener("pointermove", (e) => { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; }, { passive: true });

  const t0 = performance.now();
  function frame(now) {
    const t = reduce ? 0 : (now - t0) / 1000;
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    spin.rotation.y = 2.2 + t * 0.08;
    globe.rotation.x = my * 0.25;
    globe.rotation.y = mx * 0.35;
    const a = t * 0.35 + 0.8;
    sat.position.set(Math.cos(a) * R * 1.55, Math.sin(a) * R * 1.55, 0);
    renderer.render(scene, camera);
  }

  box.classList.add("live");
  if (reduce) { frame(t0); return; }
  let visible = true, running = false;
  const loop = () => {
    if (running) return;
    running = true;
    const step = (n) => { if (!visible || document.hidden) { running = false; return; } frame(n); requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }).observe(box);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) loop(); });
  loop();
}

try {
  if (box && canvas) start();
} catch (err) {
  // Keep the SVG globe.
  if (box) box.classList.remove("live");
}
