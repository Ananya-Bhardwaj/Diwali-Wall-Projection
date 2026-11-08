// Add inside createRathGroup()
function addDivineAura(group) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Radial gradient for a soft glowing aura
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending });
  const geometry = new THREE.PlaneGeometry(7, 7);
  const auraMesh = new THREE.Mesh(geometry, material);
  auraMesh.position.set(0, 0, -0.2); // Placed slightly behind the rath
  group.add(auraMesh);
}


// Add inside createRathGroup()
function addRathBanners(group) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Draw festive triangular flags (Dhwaja)
  ctx.fillStyle = "#e60000"; // Red festive flag
  ctx.beginPath();
  ctx.moveTo(40, 60); ctx.lineTo(90, 20); ctx.lineTo(90, 80); ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffd700"; // Gold border / second flag
  ctx.beginPath();
  ctx.moveTo(120, 60); ctx.lineTo(170, 10); ctx.lineTo(170, 70); ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const geometry = new THREE.PlaneGeometry(3, 1.5);
  const bannerMesh = new THREE.Mesh(geometry, material);
  bannerMesh.position.set(0, 1.6, 0.1); // Positioned on top of the rath roof
  group.add(bannerMesh);
}


let rathTrailParticles;

function addRathTrail(group) {
  const count = 30;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = -3 - Math.random() * 2; // Trails behind the rath (negative X)
    positions[i + 1] = (Math.random() - 0.5) * 1.5;
    positions[i + 2] = (Math.random() - 0.5) * 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffd700,
    size: 0.2,
    transparent: true,
    opacity: 0.7
  });

  rathTrailParticles = new THREE.Points(geometry, material);
  group.add(rathTrailParticles);
}


let scene, camera, renderer, rathGroup;
    let lanternsGroup = [];
    let clock = new THREE.Clock();

    async function initExperience() {
      document.getElementById('start-btn').style.display = 'none';

      // 1. Initialize Live Video Background
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        });
        const video = document.getElementById('webcam');
        video.srcObject = stream;
      } catch (err) {
        console.warn("Camera access denied or unavailable:", err);
      }

      // 2. Setup Three.js Scene & Transparent Renderer
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 10);

      renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('ar-canvas'), alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 3. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      scene.add(ambientLight);

      // 4. Create Rath Group (Placeholder / Sprite Layer)
      createRathGroup();

      // 5. Create Shimmering Floating Lanterns System using your Image
      createShimmeringLanterns();

      window.addEventListener('resize', onWindowResize);
      animate();
    }

    function createRathGroup() {
      rathGroup = new THREE.Group();

      const textureLoader = new THREE.TextureLoader();
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide
      });

      const planeGeometry = new THREE.PlaneGeometry(8, 4);
      const rathMesh = new THREE.Mesh(planeGeometry, material);
      rathMesh.scale.set(3.2, 3.2, 3.2);
      rathGroup.add(rathMesh);

      const rathUrl = new URL('./rath.png', window.location.href).href;
      textureLoader.load(
        rathUrl,
        (texture) => {
          rathMesh.material.map = texture;
          rathMesh.material.needsUpdate = true;
          rathMesh.material.opacity = 1;
        },
        undefined,
        (err) => {
          console.warn('Could not load rath.png. Check file path or name.', err);
          const fallbackCanvas = document.createElement('canvas');
          fallbackCanvas.width = 512;
          fallbackCanvas.height = 256;
          const ctx = fallbackCanvas.getContext('2d');
          ctx.fillStyle = '#ffb700';
          ctx.fillRect(50, 100, 412, 120);
          rathMesh.material.map = new THREE.CanvasTexture(fallbackCanvas);
          rathMesh.material.needsUpdate = true;
        }
      );

      const isPortrait = window.innerHeight >= window.innerWidth;
      const baseY = isPortrait ? -1.4 : -2.0;
      const baseX = isPortrait ? 0 : 0;

      rathGroup.position.set(baseX, baseY, -6);
      scene.add(rathGroup);
    }

    function createShimmeringLanterns() {
      const textureLoader = new THREE.TextureLoader();
      const lanternUrl = new URL('./lantern.png', window.location.href).href;

      textureLoader.load(
        lanternUrl,
        (texture) => {
          const lanternCount = 50;
          const geometry = new THREE.PlaneGeometry(1, 1.2);
          const columns = 10;
          const rows = 5;

          for (let i = 0; i < lanternCount; i++) {
            const material = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              opacity: 0.55 + Math.random() * 0.2
            });

            const mesh = new THREE.Mesh(geometry, material);
            const scale = 0.5 + Math.random() * 1.5;
            mesh.scale.set(scale, scale, scale);

            const col = i % columns;
            const row = Math.floor(i / columns) % rows;
            const x = (col / (columns - 1) - 0.5) * 28 + (Math.random() - 0.5) * 2.5;
            const y = -8 + (row / (rows - 1)) * 16 + (Math.random() - 0.5) * 2;

            mesh.position.set(
              x,
              y,
              -8 + (Math.random() - 0.5) * 12
            );

            mesh.userData = {
              speedY: 0.002 + Math.random() * 0.004,
              shimmerSpeed: 1.2 + Math.random() * 2.2,
              baseOpacity: material.opacity,
              offset: Math.random() * Math.PI
            };

            scene.add(mesh);
            lanternsGroup.push(mesh);
          }
        },
        undefined,
        (err) => {
          console.log('Ensure lantern.png is available in your directory or hosted URL.', err);
        }
      );
    }

    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate Rath
      if (rathGroup) {
        const isPortrait = window.innerHeight >= window.innerWidth;
        const introProgress = Math.min(elapsedTime / 14, 1);

        const targetX = isPortrait ? 0 : 0;
        const targetY = isPortrait ? -1.4 : -2.0;

        rathGroup.position.x = -13 + introProgress * 13 + (isPortrait ? 0 : 0.8);
        rathGroup.position.y = targetY + Math.sin(elapsedTime * 0.2) * (isPortrait ? 0.15 : 0.22);
      }

      // Animate Lanterns (Floating up + Shimmering Opacity/Scale)
      lanternsGroup.forEach((lantern) => {
        // Float upward
        lantern.position.y += lantern.userData.speedY * 0.38;

        // Reset position if it floats off the top of the screen
        if (lantern.position.y > 8) {
          lantern.position.y = -8;
          lantern.position.x = (Math.random() - 0.5) * 28;
        }

        // Shimmer effect: pulsing opacity and subtle scale wobble
        const shimmer = Math.sin(elapsedTime * lantern.userData.shimmerSpeed * 0.45 + lantern.userData.offset);
        lantern.material.opacity = lantern.userData.baseOpacity * (0.62 + 0.38 * shimmer);
      });

      renderer.render(scene, camera);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      if (rathGroup) {
        const isPortrait = window.innerHeight >= window.innerWidth;
        rathGroup.position.y = isPortrait ? -1.4 : -2.0;
      }
    }