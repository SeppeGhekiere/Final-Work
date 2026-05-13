import * as THREE from "three";

const VERTEX_SHADER = `
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
`;

const FRAGMENT_SHADER = `
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

		vec3 base = vec3(0.8, 0.5, 0.1);
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
				pulseBand = smoothstep(0.0, edgeSoftness, distBelow)
					* (1.0 - smoothstep(pulseLength, pulseLength + edgeSoftness, distBelow));
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
				float redEdge = 3.0;
				redPulseBand = smoothstep(0.0, redEdge, distFromRed)
					* (1.0 - smoothstep(0.0, redEdge, distFromRed - redPulseLength));
				vec3 red = vec3(1.0, 0.0, 0.0);
				color = mix(color, red, redPulseBand);
			}
		}

		float depthFade = exp(-vDepth * 0.025);
		color *= depthFade;

		gl_FragColor = vec4(color, 1.0);
	}
`;

export function createShaderMaterial({ spatialWave = false, pulseEnabled = true } = {}) {
	return new THREE.ShaderMaterial({
		depthWrite: true,
		depthTest: true,
		side: THREE.DoubleSide,

		uniforms: {
			time: { value: 0 },
			uCameraPos: { value: new THREE.Vector3() },
			uSpatialWave: { value: spatialWave ? 1 : 0 },
			uPulse: { value: pulseEnabled ? 1 : 0 },
			uGrowth: { value: 1.0 },
			uRedPulseTime: { value: -1.0 },
		},

		vertexShader: VERTEX_SHADER,
		fragmentShader: FRAGMENT_SHADER,
	});
}
