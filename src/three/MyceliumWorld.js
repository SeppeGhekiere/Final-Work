import * as THREE from "three";

const MAX_HEADS = 4;
const MAX_POINTS_PER_HEAD = 20;
const MAX_WEB_SEGMENTS = 30;
const WEB_SEGMENT_POINTS = 20;

export default class MyceliumWorld {
  constructor(container, getState) {
    this.container = container;
    this.getState = getState;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050403);

    // Fog for depth
    this.scene.fog = new THREE.FogExp2(0x050403, 0.015);

    // PerspectiveCamera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.inset = '0';
    this.renderer.domElement.style.zIndex = '0';

    this.container.appendChild(this.renderer.domElement);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x221100, 0.5);
    this.scene.add(ambientLight);

    // Shared materials for heads and web
    this.headMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,

      uniforms: {
        time: { value: 0 },
        intensity: { value: 1.0 },
        colorCore: { value: new THREE.Color(0xff7a1a) },
        colorOuter: { value: new THREE.Color(0xffb066) }
      },

      vertexShader: `
        attribute float lineProgress;
        varying float vProgress;

        void main() {
          vProgress = lineProgress;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform vec3 colorCore;
        uniform vec3 colorOuter;

        varying float vProgress;

        void main() {
          float flow = fract(vProgress * 2.0 - time * 0.8);
          flow = smoothstep(0.2, 0.8, flow);

          vec3 color = mix(colorOuter, colorCore, flow);
          float alpha = (0.5 + flow * 0.4) * intensity;
          alpha = min(alpha, 0.9);

          gl_FragColor = vec4(color, alpha);
        }
      `
    });

    this.webMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,

      uniforms: {
        time: { value: 0 },
        intensity: { value: 0.6 },
        colorCore: { value: new THREE.Color(0xff7a1a) },
        colorOuter: { value: new THREE.Color(0xffb066) }
      },

      vertexShader: `
        attribute float lineProgress;
        varying float vProgress;

        void main() {
          vProgress = lineProgress;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform vec3 colorCore;
        uniform vec3 colorOuter;

        varying float vProgress;

        void main() {
          float flow = fract(vProgress * 1.5 - time * 0.3);
          flow = smoothstep(0.2, 0.8, flow);

          vec3 color = mix(colorOuter, colorCore, flow * 0.5);
          float alpha = (0.2 + flow * 0.2) * intensity;
          alpha = min(alpha, 0.6);

          gl_FragColor = vec4(color, alpha);
        }
      `
    });

    // Growth heads (actively growing)
    this.growthHeads = [];

    // Static web segments
    this.webSegments = [];

    // Initialize with 3 growth heads
    for (let i = 0; i < 3; i++) {
      const startPos = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        10 + Math.random() * 20
      );
      this.createGrowthHead(startPos);
    }

    // Animation loop
    this.time = 0;
    this.frame = 0;

    this.handleResize();
    window.addEventListener("resize", () => this.handleResize());

    this.animate();
  }

  // Create a new growth head
  createGrowthHead(position) {
    const positions = new Float32Array(MAX_POINTS_PER_HEAD * 3);
    const progress = new Float32Array(MAX_POINTS_PER_HEAD);

    for (let i = 0; i < MAX_POINTS_PER_HEAD; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      progress[i] = i / MAX_POINTS_PER_HEAD;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('lineProgress', new THREE.BufferAttribute(progress, 1));

    const line = new THREE.Line(geometry, this.headMaterial.clone());
    this.scene.add(line);

    const dir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();

    const head = {
      positions,
      progress,
      geometry,
      line,
      direction: dir,
      life: 1,
      pointCount: 1
    };

    this.growthHeads.push(head);
    return head;
  }

  // Convert head to web segment (freeze it)
  freezeHeadToWeb(head) {
    // Create new web segment with same points
    const positions = new Float32Array(WEB_SEGMENT_POINTS * 3);
    const progress = new Float32Array(WEB_SEGMENT_POINTS);

    // Copy current points (should be exactly MAX_POINTS_PER_HEAD)
    const copyCount = Math.min(head.pointCount, WEB_SEGMENT_POINTS);
    for (let i = 0; i < copyCount; i++) {
      positions[i * 3] = head.positions[i * 3];
      positions[i * 3 + 1] = head.positions[i * 3 + 1];
      positions[i * 3 + 2] = head.positions[i * 3 + 2];
      progress[i] = i / WEB_SEGMENT_POINTS;
    }

    // Fill remaining with last point
    for (let i = copyCount; i < WEB_SEGMENT_POINTS; i++) {
      positions[i * 3] = head.positions[(copyCount - 1) * 3];
      positions[i * 3 + 1] = head.positions[(copyCount - 1) * 3 + 1];
      positions[i * 3 + 2] = head.positions[(copyCount - 1) * 3 + 2];
      progress[i] = i / WEB_SEGMENT_POINTS;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('lineProgress', new THREE.BufferAttribute(progress, 1));

    const line = new THREE.Line(geometry, this.webMaterial.clone());
    this.scene.add(line);

    const webSegment = {
      geometry,
      line,
      life: 1,
      age: 0
    };

    this.webSegments.push(webSegment);

    // Remove the head
    this.scene.remove(head.line);
    head.geometry.dispose();
    head.line.material.dispose();

    // Cap web segments - remove oldest if too many
    if (this.webSegments.length > MAX_WEB_SEGMENTS) {
      const oldest = this.webSegments.shift();
      this.scene.remove(oldest.line);
      oldest.geometry.dispose();
      oldest.line.material.dispose();
    }
  }

  // Grow head forward
  growHead(head, intensity) {
    if (head.pointCount >= MAX_POINTS_PER_HEAD) {
      // Freeze to web, spawn new head
      this.freezeHeadToWeb(head);
      return;
    }

    const lastX = head.positions[(head.pointCount - 1) * 3];
    const lastY = head.positions[(head.pointCount - 1) * 3 + 1];
    const lastZ = head.positions[(head.pointCount - 1) * 3 + 2];

    // Smooth directional memory
    const noise = new THREE.Vector3(
      (Math.random() - 0.5),
      (Math.random() - 0.5),
      (Math.random() - 0.5)
    );
    head.direction.lerp(noise.normalize(), 0.08).normalize();

    // Slight bias toward background
    head.direction.z -= 0.05;
    head.direction.normalize();

    // Variable step
    const step = 0.8 + Math.random() * 0.6;

    const newX = lastX + head.direction.x * step;
    const newY = lastY + head.direction.y * step;
    const newZ = lastZ + head.direction.z * step;

    const idx = head.pointCount;
    head.positions[idx * 3] = newX;
    head.positions[idx * 3 + 1] = newY;
    head.positions[idx * 3 + 2] = newZ;
    head.pointCount++;

    head.geometry.attributes.position.needsUpdate = true;

    // Branching - spawn new head from this point
    const branchChance = 0.02 + intensity * 0.01;
    if (Math.random() < branchChance && head.pointCount > 5 && this.growthHeads.length < MAX_HEADS) {
      const branchPos = new THREE.Vector3(newX, newY, newZ);
      this.createGrowthHead(branchPos);
    }
  }

  // Update growth
  updateGrowth() {
    const state = this.getState();
    const intensity = state.time_loss || 0;

    // Grow all heads
    const headsToRemove = [];
    this.growthHeads.forEach((head, index) => {
      this.growHead(head, intensity);
      if (head.pointCount >= MAX_POINTS_PER_HEAD) {
        headsToRemove.push(index);
      }
    });

    // Remove completed heads (they've been converted to web)
    for (let i = headsToRemove.length - 1; i >= 0; i--) {
      this.growthHeads.splice(headsToRemove[i], 1);
    }

    // Random new heads from web (if we have web segments)
    if (this.webSegments.length > 0 && this.growthHeads.length < MAX_HEADS) {
      if (Math.random() < 0.01 + intensity * 0.002) {
        const randomWeb = this.webSegments[Math.floor(Math.random() * this.webSegments.length)];
        const idx = Math.floor(Math.random() * WEB_SEGMENT_POINTS);
        const pos = new THREE.Vector3(
          randomWeb.geometry.attributes.position.array[idx * 3],
          randomWeb.geometry.attributes.position.array[idx * 3 + 1],
          randomWeb.geometry.attributes.position.array[idx * 3 + 2]
        );
        this.createGrowthHead(pos);
      }
    }
  }

  // Update web segments (slow decay)
  updateWebSegments() {
    const state = this.getState();
    const intensity = state.time_loss || 0;

    this.webSegments.forEach(segment => {
      segment.age++;
      // Very slow decay
      segment.life -= 0.0002 + intensity * 0.0001;
      if (segment.line && segment.line.material) {
        segment.line.material.opacity = Math.max(segment.life * 0.6, 0);
      }
    });

    // Remove dead segments
    this.webSegments = this.webSegments.filter(segment => {
      if (segment.life <= 0) {
        this.scene.remove(segment.line);
        segment.geometry.dispose();
        segment.line.material.dispose();
        return false;
      }
      return true;
    });
  }

  // Update heads decay
  updateHeads() {
    const state = this.getState();
    const intensity = state.time_loss || 0;

    this.growthHeads.forEach(head => {
      head.life -= 0.001 + intensity * 0.0005;
      if (head.line && head.line.material) {
        head.line.material.opacity = Math.max(head.life, 0);
      }
    });

    // Remove dead heads
    this.growthHeads = this.growthHeads.filter(head => {
      if (head.life <= 0 && head.line) {
        this.scene.remove(head.line);
        head.geometry.dispose();
        head.line.material.dispose();
        return false;
      }
      return true;
    });

    // Respawn if all dead
    if (this.growthHeads.length === 0 && this.webSegments.length > 0) {
      const randomWeb = this.webSegments[Math.floor(Math.random() * this.webSegments.length)];
      const idx = Math.floor(Math.random() * WEB_SEGMENT_POINTS);
      const pos = new THREE.Vector3(
        randomWeb.geometry.attributes.position.array[idx * 3],
        randomWeb.geometry.attributes.position.array[idx * 3 + 1],
        randomWeb.geometry.attributes.position.array[idx * 3 + 2]
      );
      this.createGrowthHead(pos);
    }
  }

  // Camera drift
  updateCamera() {
    const state = this.getState();
    const intensity = state.time_loss || 0;

    const drift = intensity * 0.01;
    this.camera.position.x += (Math.random() - 0.5) * drift;
    this.camera.position.y += (Math.random() - 0.5) * drift;
    this.camera.lookAt(0, 0, 0);
  }

  // Update shader uniforms
  updateShaders() {
    this.time += 0.01;

    const t = this.getState().time_loss || 0;

    this.growthHeads.forEach(head => {
      if (head.line && head.line.material) {
        head.line.material.uniforms.time.value = this.time;
        head.line.material.uniforms.intensity.value = Math.min(1 + t * 0.1, 2.5);
      }
    });

    this.webSegments.forEach(segment => {
      if (segment.line && segment.line.material) {
        segment.line.material.uniforms.time.value = this.time;
        segment.line.material.uniforms.intensity.value = Math.min(0.6 + t * 0.05, 1.5);
      }
    });
  }

  // Main loop
  animate() {
    requestAnimationFrame(() => this.animate());

    this.frame++;

    this.updateGrowth();
    this.updateHeads();
    this.updateWebSegments();
    this.updateCamera();
    this.updateShaders();

    // Subtle scene rotation
    this.scene.rotation.y += 0.0003;

    this.renderer.render(this.scene, this.camera);
  }

  // Resize handler
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Cleanup
  destroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.renderer && this.renderer.domElement && this.container) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}