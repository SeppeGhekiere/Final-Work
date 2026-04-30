import * as THREE from "three";

const CURVE_COUNT = 130;
const POINTS_PER_CURVE = 55;
const TUBE_SEGMENTS = 50;
const TUBE_RADIAL_SEGMENTS = 6;
const SPREAD = 80;
const SNAP_THRESHOLD = 10;
const MAX_SNAP_DISTANCE = 4;
const MIN_SEGMENT_LENGTH = 2;

export default class MyceliumWorld {
	constructor(container, getState) {
		this.container = container;
		this.getState = getState;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x050403);

		this.scene.fog = new THREE.FogExp2(0x050403, 0.035);

		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
		this.camera.position.set(0, 0, 80);
		this.camera.lookAt(0, 0, 0);

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.domElement.style.position = "fixed";
		this.renderer.domElement.style.inset = "0";
		this.renderer.domElement.style.zIndex = "0";

		this.container.appendChild(this.renderer.domElement);

		const ambientLight = new THREE.AmbientLight(0x221100, 0.5);
		this.scene.add(ambientLight);

		this.time = 0;

		this.connectionMaterial = new THREE.ShaderMaterial({
			depthWrite: true,
			depthTest: true,
			side: THREE.DoubleSide,

			uniforms: {
				time: { value: 0 },
			},

			vertexShader: `
        attribute float aAlong;
        varying float vAlong;
        varying float vDepth;

        void main() {
          vAlong = aAlong;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDepth = -mvPosition.z;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,

			fragmentShader: `
        uniform float time;

        varying float vAlong;
        varying float vDepth;

        void main() {
          float repeat = 2.0;
          float speed = 0.4;
          
          float flow = vAlong * repeat - time * speed;
          float pulse = fract(flow);
          
          float band = smoothstep(0.0, 0.15, pulse) *
                       smoothstep(1.0, 0.85, pulse);
          
          vec3 base = vec3(0.5, 0.25, 0.1);
          vec3 highlight = vec3(0.7, 0.35, 0.15);
          
          vec3 color = mix(base, highlight, band);
          
          float depthFade = exp(-vDepth * 0.025);
          color *= depthFade;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
		});

		this.tubes = [];
		this.group = new THREE.Group();
		this.scene.add(this.group);

		this.generateNest();

		this.createDustParticles();

		this.frame = 0;

		this.handleResize();
		window.addEventListener("resize", () => this.handleResize());

		this.animate();
	}

	createCurve(snapPoints = []) {
		const points = [];
		const center = new THREE.Vector3(0, 0, 0);

		let pos = new THREE.Vector3((Math.random() - 0.5) * SPREAD, (Math.random() - 0.5) * SPREAD, 30 + Math.random() * 50);

		if (snapPoints.length > 0) {
			const snappedStart = this.findNearestSnapPoint(pos, snapPoints);
			if (snappedStart && pos.distanceTo(snappedStart) <= MAX_SNAP_DISTANCE) {
				pos.copy(snappedStart);
			}
		}

		let dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();

		for (let i = 0; i < POINTS_PER_CURVE; i++) {
			dir.lerp(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), 0.2).normalize();

			pos.lerp(center, 0.01);

			const nextPos = pos.clone().add(dir.multiplyScalar(2));

			if (snapPoints.length > 0 && i > 0 && i < POINTS_PER_CURVE - 1) {
				const checkPoint = pos.clone().lerp(nextPos, 0.5);
				const snappedMid = this.findNearestSnapPoint(checkPoint, snapPoints);
				if (snappedMid) {
					const snapDist = checkPoint.distanceTo(snappedMid);
					if (snapDist <= MAX_SNAP_DISTANCE) {
						const prevPoint = points[points.length - 1];
						if (prevPoint && snappedMid.distanceTo(prevPoint) >= MIN_SEGMENT_LENGTH) {
							nextPos.copy(snappedMid);
						}
					}
				}
			}

			pos = nextPos;
			points.push(pos.clone());
		}

		if (snapPoints.length > 0) {
			const originalEnd = points[points.length - 1].clone();
			const snappedEnd = this.findNearestSnapPoint(originalEnd, snapPoints);
			if (snappedEnd) {
				const snapDist = originalEnd.distanceTo(snappedEnd);
				if (snapDist <= MAX_SNAP_DISTANCE) {
					const prevPoint = points[points.length - 2];
					if (prevPoint && snappedEnd.distanceTo(prevPoint) >= MIN_SEGMENT_LENGTH) {
						points[points.length - 1].copy(snappedEnd);
					}
				}
			}
		}

		const curve = new THREE.CatmullRomCurve3(points);
		const startPoint = points[0].clone();
		const mid25 = points[Math.floor(points.length * 0.25)].clone();
		const mid50 = points[Math.floor(points.length * 0.5)].clone();
		const mid75 = points[Math.floor(points.length * 0.75)].clone();
		const endPoint = points[points.length - 1].clone();

		return { curve, startPoint, mid25, mid50, mid75, endPoint };
	}

	findNearestSnapPoint(pos, snapPoints) {
		let nearest = null;
		let nearestDist = SNAP_THRESHOLD;

		for (const sp of snapPoints) {
			const dist = pos.distanceTo(sp);
			if (dist < nearestDist) {
				nearestDist = dist;
				nearest = sp.clone();
			}
		}

		return nearest;
	}

	generateNest() {
		const snapPoints = [];

		for (let i = 0; i < CURVE_COUNT; i++) {
			const { curve, startPoint, mid25, mid50, mid75, endPoint } = this.createCurve(snapPoints);

			const radius = 0.7 + Math.sin(i * 0.3) * 0.1;

			const geometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, radius, TUBE_RADIAL_SEGMENTS, false);

			const count = geometry.attributes.position.count;
			const along = new Float32Array(count);
			const ringSize = TUBE_RADIAL_SEGMENTS + 1;

			for (let t = 0; t < TUBE_SEGMENTS + 1; t++) {
				const value = t / TUBE_SEGMENTS;
				for (let r = 0; r < ringSize; r++) {
					const index = t * ringSize + r;
					along[index] = value;
				}
			}

			geometry.setAttribute("aAlong", new THREE.BufferAttribute(along, 1));

			const mesh = new THREE.Mesh(geometry, this.connectionMaterial.clone());

			this.group.add(mesh);
			this.tubes.push(mesh);

			snapPoints.push(startPoint);
			snapPoints.push(mid25);
			snapPoints.push(mid50);
			snapPoints.push(mid75);
			snapPoints.push(endPoint);
		}
	}

	createDustParticles() {
		const DUST_COUNT = 800;
		const positions = new Float32Array(DUST_COUNT * 3);
		const sizes = new Float32Array(DUST_COUNT);

		for (let i = 0; i < DUST_COUNT; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 120;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
			sizes[i] = 0.3 + Math.random() * 0.2;
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

		const material = new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,

			uniforms: {
				time: { value: 0 },
			},

			vertexShader: `
        attribute float size;
        varying float vAlpha;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vAlpha = exp(-(-mvPosition.z) * 0.02);
          
          gl_PointSize = size * (50.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,

			fragmentShader: `
        varying float vAlpha;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = (0.15 + 0.1 * vAlpha) * (1.0 - dist * 2.0);
          vec3 color = vec3(0.4, 0.25, 0.12);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
		});

		this.dust = new THREE.Points(geometry, material);
		this.scene.add(this.dust);
	}

	updateCamera() {
		this.camera.position.set(0, 0, 80);
		this.camera.lookAt(0, 0, 0);
	}

	updateShaders() {
		this.time += 0.016;

		this.tubes.forEach((mesh) => {
			if (mesh && mesh.material) {
				mesh.material.uniforms.time.value = this.time;
			}
		});

		if (this.dust && this.dust.material) {
			this.dust.material.uniforms.time.value = this.time;

			const positions = this.dust.geometry.attributes.position.array;
			for (let i = 0; i < positions.length; i += 3) {
				positions[i] += Math.sin(this.time * 0.5 + i) * 0.01;
				positions[i + 1] += Math.cos(this.time * 0.3 + i) * 0.01;
				positions[i + 2] += Math.sin(this.time * 0.4 + i) * 0.005;
			}
			this.dust.geometry.attributes.position.needsUpdate = true;
		}
	}

	animate() {
		requestAnimationFrame(() => this.animate());

		this.frame++;

		this.updateCamera();
		this.updateShaders();

		this.renderer.render(this.scene, this.camera);
	}

	handleResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	destroy() {
		window.removeEventListener("resize", this.handleResize);

		this.tubes.forEach((mesh) => {
			if (mesh) {
				this.group.remove(mesh);
				mesh.geometry.dispose();
				mesh.material.dispose();
			}
		});

		if (this.dust) {
			this.dust.geometry.dispose();
			this.dust.material.dispose();
			this.scene.remove(this.dust);
		}

		if (this.renderer && this.renderer.domElement && this.container) {
			this.container.removeChild(this.renderer.domElement);
			this.renderer.dispose();
		}
	}
}
