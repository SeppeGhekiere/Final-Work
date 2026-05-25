import * as THREE from "three";

export default class FloatingTextManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.floatingTexts = [];
    this.textureCache = {};
  }

  add(text, color, index = 0, worldTime) {
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

    mesh.userData.spawnTime = worldTime ?? performance.now() / 1000;
    mesh.userData.index = index;
    mesh.userData.baseX = mesh.position.x;
    mesh.userData.baseY = mesh.position.y;
    mesh.userData.baseZ = this.camera.position.z;

    this.scene.add(mesh);
    this.floatingTexts.push(mesh);
  }

  update(time, cameraPosZ) {
    this.floatingTexts = this.floatingTexts.filter((mesh) => {
      const age = time - mesh.userData.spawnTime;
      const relativeZ = mesh.position.z - cameraPosZ;

      if (relativeZ < -10 || age > 4.0) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        return false;
      }

      const index = mesh.userData.index || 0;
      mesh.position.z = cameraPosZ + 15 + age * 3;
      mesh.position.x = mesh.userData.baseX + Math.sin(time * 2 + mesh.position.z * 0.1) * 1.5;
      mesh.position.y = index * 7 + Math.sin(time * 1.5 + index) * 1;

      mesh.lookAt(this.camera.position);

      if (age > 2.5) {
        mesh.material.opacity = 1 * (1 - (age - 2.5) / 1.5);
      }

      return true;
    });
  }

  clear() {
    this.floatingTexts.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.floatingTexts = [];
  }
}
