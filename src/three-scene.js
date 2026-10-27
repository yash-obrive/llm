import * as THREE from 'three';

export function initThreeScene() {
  const container = document.getElementById('webgl-container');
  if (!container) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group for all elements
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // 1. Central Core Sphere (Wireframe & Points)
  const coreGeo = new THREE.IcosahedronGeometry(4.2, 2);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x39e0ce,
    wireframe: true,
    transparent: true,
    opacity: 0.28
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  mainGroup.add(coreMesh);

  // Core point vertices
  const pointsMat = new THREE.PointsMaterial({
    color: 0x0b7c73,
    size: 0.08,
    transparent: true,
    opacity: 0.7
  });
  const corePoints = new THREE.Points(coreGeo, pointsMat);
  mainGroup.add(corePoints);

  // 2. Concentric Orbit Rings
  function createOrbitRing(radius, tiltX, tiltY) {
    const ringGeo = new THREE.BufferGeometry();
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;
    }
    ringGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x59d0b5,
      transparent: true,
      opacity: 0.35
    });
    const ring = new THREE.LineLoop(ringGeo, ringMat);
    ring.rotation.x = tiltX;
    ring.rotation.y = tiltY;
    return ring;
  }

  const ring1 = createOrbitRing(6.8, Math.PI / 3, Math.PI / 6);
  const ring2 = createOrbitRing(8.5, -Math.PI / 4, Math.PI / 4);
  const ring3 = createOrbitRing(10.2, Math.PI / 6, -Math.PI / 3);
  mainGroup.add(ring1, ring2, ring3);

  // 3. Floating Neural Particle Cloud
  const particleCount = 200;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 24;
    const y = (Math.random() - 0.5) * 22;
    const z = (Math.random() - 0.5) * 16;
    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.012,
      y: (Math.random() - 0.5) * 0.012,
      z: (Math.random() - 0.5) * 0.012
    });
  }

  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particlesMat = new THREE.PointsMaterial({
    color: 0x074139,
    size: 0.06,
    transparent: true,
    opacity: 0.5
  });
  const particleSystem = new THREE.Points(particlesGeo, particlesMat);
  mainGroup.add(particleSystem);

  // Offset main group toward center-right
  mainGroup.position.set(3, -0.5, 0);

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Scroll reaction
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  });

  // Theme adapter
  const updateThemeColors = (isLight) => {
    if (isLight) {
      coreMat.color.setHex(0x074139);
      coreMat.opacity = 0.2;
      pointsMat.color.setHex(0x0b7c73);
      particlesMat.color.setHex(0x074139);
      ring1.material.color.setHex(0x99ded6);
      ring2.material.color.setHex(0x99ded6);
      ring3.material.color.setHex(0x99ded6);
    } else {
      coreMat.color.setHex(0x39e0ce);
      coreMat.opacity = 0.28;
      pointsMat.color.setHex(0xa2f1df);
      particlesMat.color.setHex(0x8bf5e7);
      ring1.material.color.setHex(0x287c78);
      ring2.material.color.setHex(0x287c78);
      ring3.material.color.setHex(0x287c78);
    }
  };

  // Listen to theme switch event
  window.addEventListener('themeChanged', (e) => {
    updateThemeColors(e.detail.theme === 'light');
  });

  // Check initial theme (default to true for Obrive authentic teal/mint theme)
  updateThemeColors(true);

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Damped mouse follow
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    mainGroup.rotation.y = elapsedTime * 0.12 + targetX * 0.4 + scrollProgress * Math.PI * 2;
    mainGroup.rotation.x = targetY * 0.3 + Math.sin(elapsedTime * 0.2) * 0.08;

    ring1.rotation.z += 0.005;
    ring2.rotation.z -= 0.004;
    ring3.rotation.z += 0.003;

    // Subtle core pulse
    const pulse = 1 + Math.sin(elapsedTime * 1.5) * 0.04;
    coreMesh.scale.set(pulse, pulse, pulse);
    corePoints.scale.set(pulse, pulse, pulse);

    // Particle drift
    const positions = particlesGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += particleVelocities[i].x;
      positions[i * 3 + 1] += particleVelocities[i].y;
      positions[i * 3 + 2] += particleVelocities[i].z;

      // Wrap around bounds
      if (Math.abs(positions[i * 3]) > 14) particleVelocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 14) particleVelocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 10) particleVelocities[i].z *= -1;
    }
    particlesGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}
