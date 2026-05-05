import * as THREE from "three";

const CURVE_COUNT = 130;
const POINTS_PER_CURVE = 55;
const TUBE_SEGMENTS = 50;
const TUBE_RADIAL_SEGMENTS = 24;
const SPREAD = 80;
const SNAP_THRESHOLD = 10;
const MAX_SNAP_DISTANCE = 4;
const MIN_SEGMENT_LENGTH = 2;
const GENERATE_AHEAD = 20;
const REMOVE_BEHIND = 30;
const BATCH_SIZE = 20;
const FORWARD_SPEED = 0.05;
const SPATIAL_WAVE = false;
const PULSE_ENABLED = true;
const FLOOR_MAX_Z = 40;
const GROW_DURATION = 1.5;

export default class MyceliumWorld {
	constructor(container, getState) {
		this.container = container;
		this.getState = getState;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x050403);

		this.scene.fog = new THREE.Fog(0x010100, 0.1, 10);

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
		this.floatingTexts = [];
		this.textureCache = {};

		this.connectionMaterial = new THREE.ShaderMaterial({
			depthWrite: true,
			depthTest: true,
			side: THREE.DoubleSide,

			uniforms: {
				time: { value: 0 },
				uCameraPos: { value: new THREE.Vector3() },
				uSpatialWave: { value: SPATIAL_WAVE ? 1 : 0 },
				uPulse: { value: PULSE_ENABLED ? 1 : 0 },
				uGrowth: { value: 1.0 },
				uRedPulseTime: { value: -1.0 },
			},

			vertexShader: `
				attribute float aAlong;
				varying float vAlong;
				varying float vDepth;
				varying vec3 vWorldPosition;

				void main() {
					vAlong = aAlong;
					
					vec4 worldPos = modelMatrix * vec4(position, 1.0);
					vWorldPosition = worldPos.xyz;
					
					vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
					vDepth = -mvPosition.z;
					
					gl_Position = projectionMatrix * mvPosition;
				}
			`,

			fragmentShader: `
				uniform float time;
				uniform vec3 uCameraPos;
				uniform float uSpatialWave;
				uniform float uPulse;
				uniform float uGrowth;
				uniform float uRedPulseTime;

				varying float vAlong;
				varying float vDepth;
				varying vec3 vWorldPosition;

				void main() {
					if (vAlong > uGrowth) discard;
					
					float dist = length(vWorldPosition - uCameraPos);
					float maskRadius = 6.0;
					if (dist < maskRadius) discard;
					
					vec3 base = vec3(0.5, 0.25, 0.1);
					vec3 color = base;
					float pulseBand = 0.0;
					
					if (uPulse > 0.5) {
						if (uSpatialWave > 0.5) {
							float cameraZ = uCameraPos.z;
							float cycleTime = 5.0;
							float waveOffset = mod(time, cycleTime) * 20.0;
							float wavefrontZ = cameraZ - 30.0 + waveOffset;
							float distBelow = vWorldPosition.z - wavefrontZ;
							float pulseLength = 15.0;
							float edgeSoftness = 1.0;
							pulseBand = smoothstep(0.0, edgeSoftness, distBelow) * (1.0 - smoothstep(pulseLength, pulseLength + edgeSoftness, distBelow));
						} else {
							float repeat = 2.0;
							float speed = 0.4;
							float flow = vAlong * repeat - time * speed;
							float pulse = fract(flow);
							pulseBand = smoothstep(0.0, 0.15, pulse) * smoothstep(1.0, 0.85, pulse);
						}
						
						vec3 pulseColor = vec3(0.7, 0.35, 0.15);
						color = mix(base, pulseColor, pulseBand);
					}
					
					float redPulseBand = 0.0;
					if (uRedPulseTime > 0.0) {
						float redElapsed = time - uRedPulseTime;
						if (redElapsed < 5.0) {
							float cameraZ = uCameraPos.z;
							float redWavefrontZ = cameraZ - 15.0 + redElapsed * 20.0;
							float distFromRed = vWorldPosition.z - redWavefrontZ;
							float redPulseLength = 15.0;
							float redEdge = 1.0;
							redPulseBand = smoothstep(0.0, redEdge, distFromRed) * (1.0 - smoothstep(0.0, redEdge, distFromRed - redPulseLength));
							vec3 red = vec3(1.0, 0.0, 0.0);
							color = mix(color, red, redPulseBand);
						}
					}
					
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

		this.frame = 0;

		this._boundResize = () => this.handleResize();
		this._animFrameId = null;
		this._running = true;

		this.handleResize();
		window.addEventListener("resize", this._boundResize);

		this.animate();
	}

	constrainToHorizontal(dir) {
		const minZ = 0.173;
		const len = dir.length();
		const z = dir.z;
		const zRatio = Math.abs(z) / len;
		if (zRatio < minZ) {
			const scale = (minZ * len) / Math.abs(z);
			dir.x *= scale;
			dir.y *= scale;
			if (z < 0) dir.z = -minZ * len;
			else dir.z = minZ * len;
		}
		dir.normalize();
		return dir;
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
			dir = this.constrainToHorizontal(dir.lerp(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), 0.2));

			pos.lerp(center, 0.01);

			const nextPos = pos.clone().add(dir.clone().multiplyScalar(2));

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

	createSolidTubeGeometry(curve, radius, reverseDirection) {
		// console.log('createSolidTubeGeometry STARTING with radius:', radius, 'reverseDirection:', reverseDirection);
		const vertices = [];
		const indices = [];
		const along = [];

		const curvePoints = [];
		for (let i = 0; i <= TUBE_SEGMENTS; i++) {
			curvePoints.push(curve.getPointAt(i / TUBE_SEGMENTS));
		}

		for (let step = 0; step <= TUBE_SEGMENTS; step++) {
			const centerPos = curvePoints[step];
			let alongValue = step / TUBE_SEGMENTS;
			if (reverseDirection) alongValue = 1.0 - alongValue;

			vertices.push(centerPos.x, centerPos.y, centerPos.z);
			along.push(alongValue);

			const stepStartIdx = step * (TUBE_RADIAL_SEGMENTS + 1);

			for (let c = 0; c < TUBE_RADIAL_SEGMENTS; c++) {
				const angle = (c / TUBE_RADIAL_SEGMENTS) * Math.PI * 2;
				const x = centerPos.x + Math.cos(angle) * radius;
				const y = centerPos.y + Math.sin(angle) * radius;
				const z = centerPos.z;

				vertices.push(x, y, z);
				along.push(alongValue);

				if (step < TUBE_SEGMENTS) {
					const nextOuter = (step + 1) * (TUBE_RADIAL_SEGMENTS + 1) + 1 + c;
					const nextOuterNext = (step + 1) * (TUBE_RADIAL_SEGMENTS + 1) + 1 + ((c + 1) % TUBE_RADIAL_SEGMENTS);

					indices.push(stepStartIdx + 1 + c, nextOuter, stepStartIdx + 1 + ((c + 1) % TUBE_RADIAL_SEGMENTS));
					indices.push(nextOuter, nextOuterNext, stepStartIdx + 1 + ((c + 1) % TUBE_RADIAL_SEGMENTS));
				}
			}
		}

		const startCenterIdx = 0;
		for (let c = 0; c < TUBE_RADIAL_SEGMENTS; c++) {
			indices.push(startCenterIdx, startCenterIdx + 1 + ((c + 1) % TUBE_RADIAL_SEGMENTS), startCenterIdx + 1 + c);
		}

		const endCenterIdx = TUBE_SEGMENTS * (TUBE_RADIAL_SEGMENTS + 1);
		for (let c = 0; c < TUBE_RADIAL_SEGMENTS; c++) {
			indices.push(endCenterIdx, endCenterIdx + 1 + c, endCenterIdx + 1 + ((c + 1) % TUBE_RADIAL_SEGMENTS));
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
		geometry.setAttribute("aAlong", new THREE.Float32BufferAttribute(along, 1));
		geometry.setIndex(indices);

		return geometry;
	}

	generateNest() {
		const snapPoints = [];

		try {
			for (let i = 0; i < CURVE_COUNT; i++) {
				let curve, startPoint, mid25, mid50, mid75, endPoint, radius, reverseDirection, geometry, mesh;

				try {
					({ curve, startPoint, mid25, mid50, mid75, endPoint } = this.createCurve(snapPoints));
				} catch (e) {
					console.error("ERROR at createCurve, i:", i, e);
					throw e;
				}

				try {
					radius = 0.7 + Math.sin(i * 0.3) * 0.1;
					reverseDirection = endPoint.z < startPoint.z;
					geometry = this.createSolidTubeGeometry(curve, radius, reverseDirection);
					if (!geometry) {
						console.error("createSolidTubeGeometry returned null/undefined at i:", i);
						continue;
					}
				} catch (e) {
					console.error("ERROR at createSolidTubeGeometry, i:", i, e);
					throw e;
				}

				try {
					mesh = new THREE.Mesh(geometry, this.connectionMaterial.clone());
					mesh.userData.spawnTime = this.time;
					mesh.userData.targetRadius = radius;
					mesh.userData.maxZ = endPoint.z;
				} catch (e) {
					console.error("ERROR at Mesh creation, i:", i, e);
					throw e;
				}

				this.group.add(mesh);
				this.tubes.push(mesh);

				snapPoints.push(startPoint);
				snapPoints.push(mid25);
				snapPoints.push(mid50);
				snapPoints.push(mid75);
				snapPoints.push(endPoint);
			}
		} catch (e) {
			console.error("CRASH in generateNest:", e);
		}
	}

	generateNewTubes() {
		if (this.camera.position.z < this.lastGeneratedZ - FLOOR_MAX_Z) return;

		const snapPoints = this.snapPoints.slice(-50);

		for (let i = 0; i < BATCH_SIZE; i++) {
			const zOffset = 10 + Math.random() * 20;
			const { curve, startPoint, mid25, mid50, mid75, endPoint } = this.createCurveAtZ(this.lastGeneratedZ + zOffset, snapPoints);

			const radius = 0.7 + Math.random() * 0.2;
			const reverseDirection = endPoint.z < startPoint.z;
			const geometry = this.createSolidTubeGeometry(curve, radius, reverseDirection);

			const mesh = new THREE.Mesh(geometry, this.connectionMaterial.clone());
			mesh.userData.spawnTime = this.time;
			mesh.userData.targetRadius = radius;
			mesh.userData.maxZ = endPoint.z;
			mesh.userData.startZ = startPoint.z;
			mesh.userData.endZ = endPoint.z;

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

	createCurveAtZ(zBase, snapPoints = []) {
		const points = [];
		const center = new THREE.Vector3(0, 0, zBase);

		let pos = new THREE.Vector3((Math.random() - 0.5) * SPREAD, (Math.random() - 0.5) * SPREAD, zBase + Math.random() * 50);

		if (snapPoints.length > 0) {
			const snappedStart = this.findNearestSnapPoint(pos, snapPoints);
			if (snappedStart && pos.distanceTo(snappedStart) <= MAX_SNAP_DISTANCE) {
				pos.copy(snappedStart);
			}
		}

		let dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();

		for (let i = 0; i < POINTS_PER_CURVE; i++) {
			dir = this.constrainToHorizontal(dir.lerp(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), 0.2));

			pos.lerp(center, 0.01);

			const nextPos = pos.clone().add(dir.clone().multiplyScalar(2));

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

	removeOldTubes() {
		const cameraZ = this.camera.position.z;
		const removeThreshold = cameraZ - REMOVE_BEHIND;

		this.tubes = this.tubes.filter((mesh) => {
			const tubeZ = mesh.userData.maxZ || 0;

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

	updateCamera() {
		this.time += 0.016;
		this.totalDistance += FORWARD_SPEED;

		const zPos = 40 + this.totalDistance;
		const xWeave = Math.sin(this.time * 0.5) * 6;
		const yWeave = Math.cos(this.time * 0.7) * 4;

		this.camera.position.set(xWeave, yWeave, zPos);
		this.camera.lookAt(xWeave, yWeave, zPos + 15);

		this.generateNewTubes();
		this.removeOldTubes();
	}

	updateShaders() {
		const camPos = this.camera.position;

		if (this.tubes.length === 0) {
			return;
		}

		this.tubes.forEach((mesh) => {
			if (mesh && mesh.material) {
				mesh.material.uniforms.time.value = this.time;
				mesh.material.uniforms.uCameraPos.value.copy(camPos);

				if (mesh.userData.spawnTime !== undefined) {
					const age = this.time - mesh.userData.spawnTime;
					const growth = Math.min(age / GROW_DURATION, 1.0);
					mesh.material.uniforms.uGrowth.value = growth;
				}
			}
		});
	}

	animate() {
		if (!this._running) return;
		this._animFrameId = requestAnimationFrame(() => this.animate());

		this.frame++;

		this.updateCamera();
		this.updateShaders();
		this.updateFloatingTexts();

		this.renderer.render(this.scene, this.camera);
	}

	handleResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	destroy() {
		this._running = false;
		if (this._animFrameId) {
			cancelAnimationFrame(this._animFrameId);
		}
		window.removeEventListener("resize", this._boundResize);

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

	setSpatialWave(enabled) {
		this.tubes.forEach((mesh) => {
			mesh.material.uniforms.uSpatialWave.value = enabled ? 1 : 0;
		});
		this.connectionMaterial.uniforms.uSpatialWave.value = enabled ? 1 : 0;
	}

	getSpatialWave() {
		return this.connectionMaterial.uniforms.uSpatialWave.value > 0.5;
	}

	setPulse(enabled) {
		this.tubes.forEach((mesh) => {
			mesh.material.uniforms.uPulse.value = enabled ? 1 : 0;
		});
		this.connectionMaterial.uniforms.uPulse.value = enabled ? 1 : 0;
	}

	getPulse() {
		return this.connectionMaterial.uniforms.uPulse.value > 0.5;
	}

	// eslint-disable-next-line no-unused-vars
	triggerPulse(_color) {
		const t = this.time;
		this.tubes.forEach((mesh) => {
			mesh.material.uniforms.uRedPulseTime.value = t;
		});
		this.connectionMaterial.uniforms.uRedPulseTime.value = t;
	}

	addFloatingText(text, color, index = 0) {
		const cacheKey = text + '-' + color;
		let texture = this.textureCache[cacheKey];
		
		if (!texture) {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = 768;
			canvas.height = 128;
			
			ctx.fillStyle = color;
			ctx.font = 'italic 36px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(text, canvas.width / 2, canvas.height / 2);
			
			texture = new THREE.CanvasTexture(canvas);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.needsUpdate = true;
			this.textureCache[cacheKey] = texture;
		}
		
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
			opacity: 1,
			side: THREE.DoubleSide,
			depthWrite: false,
			fog: false,
		});
		
		const geometry = new THREE.PlaneGeometry(36, 6);
		const mesh = new THREE.Mesh(geometry, material);
		
		// Position in front of camera (closer for visibility)
		const spawnZ = this.camera.position.z + 15 + Math.random() * 10;
		mesh.position.x = (Math.random() - 0.5) * 30;
		mesh.position.y = (index * 7) + (Math.random() - 0.5) * 3;
		mesh.position.z = spawnZ;
		
		// Billboard - make text face camera
		mesh.lookAt(this.camera.position);
		
		mesh.userData.spawnTime = this.time;
		mesh.userData.index = index;
		mesh.userData.baseX = mesh.position.x;
		mesh.userData.baseY = mesh.position.y;
		mesh.userData.baseZ = this.camera.position.z;
		
		this.scene.add(mesh);
		this.floatingTexts.push(mesh);
	}

	updateFloatingTexts() {
		const camZ = this.camera.position.z;
		
		this.floatingTexts = this.floatingTexts.filter((mesh) => {
			const age = this.time - mesh.userData.spawnTime;
			const relativeZ = mesh.position.z - camZ;
			
			// Remove if too far behind camera or too old
			if (relativeZ < -10 || age > 4.0) {
				this.scene.remove(mesh);
				mesh.geometry.dispose();
				mesh.material.dispose();
				return false;
			}
			
			// Move with camera (stay in front), offset by index so multiple texts don't overlap
			const index = mesh.userData.index || 0;
			mesh.position.z = camZ + 15 + (age * 3);
			mesh.position.x = mesh.userData.baseX + Math.sin(this.time * 2 + mesh.position.z * 0.1) * 1.5;
			mesh.position.y = (index * 7) + Math.sin(this.time * 1.5 + index) * 1;
			
			// Billboard - keep facing camera
			mesh.lookAt(this.camera.position);
			
			// Fade out
			if (age > 2.5) {
				mesh.material.opacity = 1 * (1 - (age - 2.5) / 1.5);
			}
			
			return true;
		});
	}
}
