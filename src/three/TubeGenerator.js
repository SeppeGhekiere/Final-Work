import * as THREE from "three";
import { createSolidTubeGeometry } from "./TubeGeometry";

const CURVE_COUNT = 130;
const POINTS_PER_CURVE = 55;
const SPREAD = 80;
const SNAP_THRESHOLD = 10;
const MAX_SNAP_DISTANCE = 4;
const MIN_SEGMENT_LENGTH = 2;
const BATCH_SIZE = 20;
const GENERATE_AHEAD = 20;
const FLOOR_MAX_Z = 40;

function constrainToHorizontal(dir) {
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

function findNearestSnapPoint(pos, snapPoints) {
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

function buildCurvePoints(zBase, snapPoints) {
	const points = [];
	const center = new THREE.Vector3(0, 0, zBase);

	let pos = new THREE.Vector3(
		(Math.random() - 0.5) * SPREAD,
		(Math.random() - 0.5) * SPREAD,
		zBase + Math.random() * 50,
	);

	if (snapPoints.length > 0) {
		const snappedStart = findNearestSnapPoint(pos, snapPoints);
		if (snappedStart && pos.distanceTo(snappedStart) <= MAX_SNAP_DISTANCE) {
			pos.copy(snappedStart);
		}
	}

	let dir = new THREE.Vector3(
		Math.random() - 0.5,
		Math.random() - 0.5,
		Math.random() - 0.5,
	).normalize();

	for (let i = 0; i < POINTS_PER_CURVE; i++) {
		dir = constrainToHorizontal(
			dir.lerp(
				new THREE.Vector3(
					Math.random() - 0.5,
					Math.random() - 0.5,
					Math.random() - 0.5,
				).normalize(),
				0.2,
			),
		);

		pos.lerp(center, 0.01);

		const nextPos = pos.clone().add(dir.clone().multiplyScalar(2));

		if (snapPoints.length > 0 && i > 0 && i < POINTS_PER_CURVE - 1) {
			const checkPoint = pos.clone().lerp(nextPos, 0.5);
			const snappedMid = findNearestSnapPoint(checkPoint, snapPoints);
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
		const snappedEnd = findNearestSnapPoint(originalEnd, snapPoints);
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

export function generateNest(time, group, tubes, connectionMaterial) {
	const snapPoints = [];

	for (let i = 0; i < CURVE_COUNT; i++) {
		const { curve, startPoint, mid25, mid50, mid75, endPoint } = buildCurvePoints(30 + Math.random() * 50, snapPoints);

		const radius = 0.7 + Math.sin(i * 0.3) * 0.1;
		const reverseDirection = endPoint.z < startPoint.z;
		const geometry = createSolidTubeGeometry(curve, radius, reverseDirection);

		const mesh = new THREE.Mesh(geometry, connectionMaterial.clone());
		mesh.userData.spawnTime = time;
		mesh.userData.targetRadius = radius;
		mesh.userData.maxZ = endPoint.z;

		group.add(mesh);
		tubes.push(mesh);

		snapPoints.push(startPoint);
		snapPoints.push(mid25);
		snapPoints.push(mid50);
		snapPoints.push(mid75);
		snapPoints.push(endPoint);
	}

	return snapPoints;
}

export function generateNewTubes(cameraZ, time, lastGeneratedZ, group, tubes, snapPoints, connectionMaterial) {
	if (cameraZ < lastGeneratedZ - FLOOR_MAX_Z) return lastGeneratedZ;

	const recentSnapPoints = snapPoints.slice(-50);

	for (let i = 0; i < BATCH_SIZE; i++) {
		const zOffset = 10 + Math.random() * 20;
		const { curve, startPoint, mid25, mid50, mid75, endPoint } = buildCurvePoints(
			lastGeneratedZ + zOffset,
			recentSnapPoints,
		);

		const radius = 0.7 + Math.random() * 0.2;
		const reverseDirection = endPoint.z < startPoint.z;
		const geometry = createSolidTubeGeometry(curve, radius, reverseDirection);

		const mesh = new THREE.Mesh(geometry, connectionMaterial.clone());
		mesh.userData.spawnTime = time;
		mesh.userData.targetRadius = radius;
		mesh.userData.maxZ = endPoint.z;
		mesh.userData.startZ = startPoint.z;
		mesh.userData.endZ = endPoint.z;

		group.add(mesh);
		tubes.push(mesh);

		snapPoints.push(startPoint);
		snapPoints.push(mid25);
		snapPoints.push(mid50);
		snapPoints.push(mid75);
		snapPoints.push(endPoint);
	}

	return lastGeneratedZ + GENERATE_AHEAD;
}
