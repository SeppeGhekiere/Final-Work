import * as THREE from "three";

const TUBE_SEGMENTS = 50;
const TUBE_RADIAL_SEGMENTS = 24;

export function createSolidTubeGeometry(curve, radius, reverseDirection) {
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

export { TUBE_SEGMENTS, TUBE_RADIAL_SEGMENTS };
