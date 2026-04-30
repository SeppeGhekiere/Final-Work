import * as THREE from "three";

const CURVE_COUNT = 130;
const POINTS_PER_CURVE = 55;
const TUBE_SEGMENTS = 50;
const TUBE_RADIAL_SEGMENTS = 6;
const SPREAD = 80;
const SNAP_THRESHOLD = 10;
const MAX_SNAP_DISTANCE = 4;
const MIN_SEGMENT_LENGTH = 2;
const GENERATE_AHEAD = 20;
const REMOVE_BEHIND = 30;
const BATCH_SIZE = 20;
const FORWARD_SPEED = 0.05;

export default class MyceliumWorld {
	constructor(container, getState) {
		this.container = container;
		this.getState = getState;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x050403);

		this.scene.fog = new THREE.FogExp2(0x050403, 0.20);

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
		this.totalDistance = 0;
		this.lastGeneratedZ = 50;
		this.snapPoints = [];

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
          
          vec3 base = vec3(0.3, 0.6, 0.2);
          vec3 highlight = vec3(0.5, 0.25, 0.1);
          
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
		this.generateBuffer();

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
		for (let i = 0; i < CURVE_COUNT; i++) {
			const { curve, startPoint, mid25, mid50, mid75, endPoint } = this.createCurve(this.snapPoints);

			const radius = 0.7 + Math.sin(i * 0.3) * 0.1;

			const geometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, radius, TUBE_RADIAL_SEGMENTS, false);

			const count = geometry.attributes.position.count;
			const along = new Float32Array(count);
			const ringSize = TUBE_RADIAL_SEGMENTS + 1;
			const reverseDirection = endPoint.z < startPoint.z;

			for (let t = 0; t < TUBE_SEGMENTS + 1; t++) {
				let value = t / TUBE_SEGMENTS;
				if (reverseDirection) value = 1.0 - value;
				for (let r = 0; r < ringSize; r++) {
					const index = t * ringSize + r;
					along[index] = value;
				}
			}

			geometry.setAttribute("aAlong", new THREE.BufferAttribute(along, 1));

			const mesh = new THREE.Mesh(geometry, this.connectionMaterial.clone());

			this.group.add(mesh);
			this.tubes.push(mesh);

			this.snapPoints.push(startPoint);
			this.snapPoints.push(mid25);
			this.snapPoints.push(mid50);
			this.snapPoints.push(mid75);
			this.snapPoints.push(endPoint);
		}

		this.lastGeneratedZ = 50;
	}

	generateBuffer() {
		const bufferZ = 80;
		for (let i = 0; i < 30; i++) {
			const zOffset = 10 + Math.random() * 30;
			const { curve, startPoint, mid25, mid50, mid75, endPoint } = this.createCurveAtZ(bufferZ + zOffset);

			const radius = 0.7 + Math.random() * 0.2;

			const geometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, radius, TUBE_RADIAL_SEGMENTS, false);

			const count = geometry.attributes.position.count;
			const along = new Float32Array(count);
			const ringSize = TUBE_RADIAL_SEGMENTS + 1;
			const reverseDirection = endPoint.z < startPoint.z;

			for (let t = 0; t < TUBE_SEGMENTS + 1; t++) {
				let value = t / TUBE_SEGMENTS;
				if (reverseDirection) value = 1.0 - value;
				for (let r = 0; r < ringSize; r++) {
					const index = t * ringSize + r;
					along[index] = value;
				}
			}

			geometry.setAttribute("aAlong", new THREE.BufferAttribute(along, 1));

			const mesh = new THREE.Mesh(geometry, this.connectionMaterial.clone());

			this.group.add(mesh);
			this.tubes.push(mesh);

			this.snapPoints.push(startPoint);
			this.snapPoints.push(mid25);
			this.snapPoints.push(mid50);
			this.snapPoints.push(mid75);
			this.snapPoints.push(endPoint);
		}

		this.lastGeneratedZ = 120;
	}

	updateCamera() {
		this.time += 0.002;
		this.totalDistance += FORWARD_SPEED;

		const zPos = 40 + this.totalDistance;
		const xWeave = Math.sin(this.time * 0.5) * 6;
		const yWeave = Math.cos(this.time * 0.7) * 4;

		this.camera.position.set(xWeave, yWeave, zPos);
		this.camera.lookAt(xWeave, yWeave, zPos + 15);

		this.generateNewTubes();
		this.removeOldTubes();
	}

	generateNewTubes() {
		if (this.camera.position.z < this.lastGeneratedZ - 40) return;

		for (let i = 0; i < BATCH_SIZE; i++) {
			const zOffset = 10 + Math.random() * 20;
			const { curve, startPoint, mid25, mid50, mid75, endPoint } = this.createCurveAtZ(this.lastGeneratedZ + zOffset);

			const radius = 0.7 + Math.random() * 0.2;

			const geometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, radius, TUBE_RADIAL_SEGMENTS, false);

			const count = geometry.attributes.position.count;
			const along = new Float32Array(count);
			const ringSize = TUBE_RADIAL_SEGMENTS + 1;
			const reverseDirection = endPoint.z < startPoint.z;

			for (let t = 0; t < TUBE_SEGMENTS + 1; t++) {
				let value = t / TUBE_SEGMENTS;
				if (reverseDirection) value = 1.0 - value;
				for (let r = 0; r < ringSize; r++) {
					const index = t * ringSize + r;
					along[index] = value;
				}
			}

			geometry.setAttribute("aAlong", new THREE.BufferAttribute(along, 1));

			const mesh = new THREE.Mesh(geometry, this.connectionMaterial.clone());

			this.group.add(mesh);
			this.tubes.push(mesh);

			this.snapPoints.push(startPoint);
			this.snapPoints.push(mid25);
			this.snapPoints.push(mid50);
			this.snapPoints.push(mid75);
			this.snapPoints.push(endPoint);
		}

		this.lastGeneratedZ += GENERATE_AHEAD;
	}

	createCurveAtZ(zBase) {
		const points = [];
		const center = new THREE.Vector3(0, 0, zBase);

		let pos = new THREE.Vector3(
			(Math.random() - 0.5) * SPREAD,
			(Math.random() - 0.5) * SPREAD,
			zBase + Math.random() * 50
		);

		if (this.snapPoints.length > 0) {
			const snappedStart = this.findNearestSnapPoint(pos, this.snapPoints);
			if (snappedStart && pos.distanceTo(snappedStart) <= MAX_SNAP_DISTANCE) {
				pos.copy(snappedStart);
			}
		}

		let dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();

		for (let i = 0; i < POINTS_PER_CURVE; i++) {
			dir.lerp(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), 0.2).normalize();

			pos.lerp(center, 0.01);

			const nextPos = pos.clone().add(dir.multiplyScalar(2));

			if (this.snapPoints.length > 0 && i > 0 && i < POINTS_PER_CURVE - 1) {
				const checkPoint = pos.clone().lerp(nextPos, 0.5);
				const snappedMid = this.findNearestSnapPoint(checkPoint, this.snapPoints);
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

		if (this.snapPoints.length > 0) {
			const originalEnd = points[points.length - 1].clone();
			const snappedEnd = this.findNearestSnapPoint(originalEnd, this.snapPoints);
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

	removeOldTubes() {
		const cameraZ = this.camera.position.z;
		const removeThreshold = cameraZ - REMOVE_BEHIND;

		this.tubes = this.tubes.filter((mesh) => {
			const box = new THREE.Box3().setFromObject(mesh);
			const tubeZ = box.max.z;

			if (tubeZ < removeThreshold) {
				this.group.remove(mesh);
				mesh.geometry.dispose();
				mesh.material.dispose();
				return false;
			}
			return true;
		});

		this.snapPoints = this.snapPoints.filter((point) => point.z >= removeThreshold);
	}

	updateShaders() {
		this.time += 0.016;

		this.tubes.forEach((mesh) => {
			if (mesh && mesh.material) {
				mesh.material.uniforms.time.value = this.time;
			}
		});
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

		if (this.renderer && this.renderer.domElement && this.container) {
			this.container.removeChild(this.renderer.domElement);
			this.renderer.dispose();
		}
	}
}
