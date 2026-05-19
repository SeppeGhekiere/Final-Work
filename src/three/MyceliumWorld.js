import * as THREE from "three";
import { createShaderMaterial } from "./shaders";
import { generateNest, generateNewTubes } from "./TubeGenerator";

const REMOVE_BEHIND = 30;
const FORWARD_SPEED = 0.05;
const GROW_DURATION = 1.5;
const SPATIAL_WAVE = false;
const PULSE_ENABLED = true;

export default class MyceliumWorld {
	constructor(container, getState) {
		this.container = container;
		this.getState = getState;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x00000);
		this.scene.fog = new THREE.Fog(0x000000, 0.1, 8);

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

		this.connectionMaterial = createShaderMaterial({ spatialWave: SPATIAL_WAVE, pulseEnabled: PULSE_ENABLED });

		this.tubes = [];
		this.group = new THREE.Group();
		this.scene.add(this.group);

		this.snapPoints = generateNest(this.time, this.group, this.tubes, this.connectionMaterial);

		this.frame = 0;

		this._boundResize = () => this.handleResize();
		this._animFrameId = null;
		this._running = true;

		this.handleResize();
		window.addEventListener("resize", this._boundResize);

		this.animate();
	}

	removeOldTubes() {
		const cameraZ = this.camera.position.z;
		const removeThreshold = cameraZ - REMOVE_BEHIND;

		this.tubes.forEach((mesh) => {
			const tubeZ = mesh.userData.maxZ || 0;
			if (tubeZ < removeThreshold && mesh.userData.despawnTime === undefined) {
				mesh.userData.despawnTime = this.time;
				mesh.userData.despawnStartGrowth = mesh.material.uniforms.uGrowth.value;
			}
		});

		this.tubes = this.tubes.filter((mesh) => {
			if (mesh.userData.shrunk) {
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
		const state = this.getState ? this.getState() : { tension: 0, time_loss: 0 };
		const tension = state.tension || 0;
		
		this.time += 0.016;

		const speedBoost = Math.min(tension * 0.005, 0.05);
		this.totalDistance += (0.05 + speedBoost);

		const zPos = 40 + this.totalDistance;
		const xWeave = Math.sin(this.time * 0.5) * 6;
		const yWeave = Math.cos(this.time * 0.7) * 4;

		this.camera.position.set(xWeave, yWeave, zPos);
		this.camera.lookAt(xWeave, yWeave, zPos + 15);

		this.lastGeneratedZ = generateNewTubes(
			this.camera.position.z,
			this.time,
			this.lastGeneratedZ,
			this.group,
			this.tubes,
			this.snapPoints,
			this.connectionMaterial,
		);
		this.removeOldTubes();
	}

	updateShaders() {
		const camPos = this.camera.position;
		const state = this.getState ? this.getState() : { tension: 0, time_loss: 0 };
		const tension = state.tension || 0;
		const timeLoss = state.time_loss || 0;

		if (this.tubes.length === 0) return;

		this.tubes.forEach((mesh) => {
			if (mesh && mesh.material) {
				mesh.material.uniforms.time.value = this.time;
				mesh.material.uniforms.uCameraPos.value.copy(camPos);
				mesh.material.uniforms.uTension.value = tension;
				mesh.material.uniforms.uTimeLoss.value = timeLoss;

				if (mesh.userData.despawnTime !== undefined) {
					const elapsed = this.time - mesh.userData.despawnTime;
					const progress = Math.min(elapsed / 1.5, 1.0);
					const startGrowth = mesh.userData.despawnStartGrowth;
					mesh.material.uniforms.uGrowth.value = Math.max(startGrowth * (1.0 - progress), 0.0);
					if (progress >= 1.0) {
						mesh.userData.shrunk = true;
					}
				} else if (mesh.userData.spawnTime !== undefined) {
					const age = this.time - mesh.userData.spawnTime;
					const growth = Math.min(age / 1.5, 1.0);
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
		const cacheKey = text + "-" + color;
		let texture = this.textureCache[cacheKey];

		if (!texture) {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			canvas.width = 768;
			canvas.height = 128;

			ctx.fillStyle = color;
			ctx.font = "italic 36px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
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

		const spawnZ = this.camera.position.z + 15 + Math.random() * 10;
		mesh.position.x = (Math.random() - 0.5) * 30;
		mesh.position.y = index * 7 + (Math.random() - 0.5) * 3;
		mesh.position.z = spawnZ;

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

			if (relativeZ < -10 || age > 4.0) {
				this.scene.remove(mesh);
				mesh.geometry.dispose();
				mesh.material.dispose();
				return false;
			}

			const index = mesh.userData.index || 0;
			mesh.position.z = camZ + 15 + age * 3;
			mesh.position.x = mesh.userData.baseX + Math.sin(this.time * 2 + mesh.position.z * 0.1) * 1.5;
			mesh.position.y = index * 7 + Math.sin(this.time * 1.5 + index) * 1;

			mesh.lookAt(this.camera.position);

			if (age > 2.5) {
				mesh.material.opacity = 1 * (1 - (age - 2.5) / 1.5);
			}

			return true;
		});
	}
}
