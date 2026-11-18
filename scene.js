// Three.js background: golden film reel, orbiting film frames and a starfield.
(function () {
  if (!window.THREE) return;
  const canvas = document.getElementById("bg");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07050a, 0.035);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 0, 14);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const gold = new THREE.PointLight(0xffc35a, 2.2, 60); gold.position.set(6, 6, 10); scene.add(gold);
  const red = new THREE.PointLight(0xc1121f, 2, 60); red.position.set(-8, -4, 6); scene.add(red);

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5c451, metalness: 0.9, roughness: 0.25 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a120a, metalness: 0.6, roughness: 0.5 });

  // Film reel
  const reel = new THREE.Group();
  reel.add(new THREE.Mesh(new THREE.TorusGeometry(3, 0.28, 24, 90), goldMat));
  reel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 40).rotateX(Math.PI / 2), goldMat));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.4, 0.2), goldMat);
    spoke.position.set(Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0);
    spoke.rotation.z = a - Math.PI / 2;
    reel.add(spoke);
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.22, 32).rotateX(Math.PI / 2), darkMat);
    const b = a + Math.PI / 6;
    hole.position.set(Math.cos(b) * 1.9, Math.sin(b) * 1.9, 0);
    reel.add(hole);
  }
  reel.position.set(4.5, 0.5, -2);
  scene.add(reel);

  // Orbiting film frames
  const frames = new THREE.Group();
  const frameGeo = new THREE.BoxGeometry(0.9, 0.65, 0.04);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x2b1b0a, metalness: 0.3, roughness: 0.6, emissive: 0x3a2200 });
  for (let i = 0; i < 28; i++) {
    const m = new THREE.Mesh(frameGeo, frameMat);
    const a = (i / 28) * Math.PI * 2;
    m.position.set(Math.cos(a) * 6.5, Math.sin(a * 2) * 0.6, Math.sin(a) * 6.5);
    m.lookAt(0, m.position.y, 0);
    frames.add(m);
  }
  frames.rotation.x = 0.35;
  frames.position.copy(reel.position);
  scene.add(frames);

  // Starfield / gold dust
  const N = 2200, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const c1 = new THREE.Color(0xf5c451), c2 = new THREE.Color(0xffffff), c3 = new THREE.Color(0xff6b3d);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 80;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
    const c = [c1, c2, c3][Math.floor(Math.random() * 3)];
    col.set([c.r, c.g, c.b], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.09, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false
  }));
  scene.add(stars);

  // Interaction
  const mouse = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // On phones, centre the reel behind the title
    const mobile = w < 700;
    reel.position.x = frames.position.x = mobile ? 0 : 4.5;
    reel.position.y = frames.position.y = mobile ? 2.5 : 0.5;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();
    const speed = reduced ? 0.15 : 1;
    reel.rotation.z = -t * 0.4 * speed;
    reel.rotation.y = Math.sin(t * 0.3) * 0.4;
    frames.rotation.y = t * 0.15 * speed;
    stars.rotation.y = t * 0.01 * speed;
    const scrollY = window.scrollY / window.innerHeight;
    camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.8 - scrollY * 2 - camera.position.y) * 0.04;
    camera.lookAt(0, -scrollY * 2, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
})();
