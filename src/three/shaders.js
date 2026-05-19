import * as THREE from "three";

const VERTEX_SHADER = `
	attribute float aAlong;

	varying float vAlong;
	varying float vDepth;
	varying vec3 vWorldPosition;

	uniform float time;
	uniform float uNoiseAmp;
	uniform float uNoiseSpeed;
	uniform float uNoiseFreq;
	uniform float uTimeLoss;

	float hash31(vec3 p) {
		p = fract(p * 0.3183099);
		p *= 17.0;
		return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
	}

	float noise3(vec3 p) {
		vec3 i = floor(p);
		vec3 f = fract(p);
		f = f * f * (3.0 - 2.0 * f);
		return mix(
			mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
				mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
			mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
				mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
			f.z
		);
	}

	void main() {
		vAlong = aAlong;

		float distortion = 1.0 + uTimeLoss * 0.15;
		float swayAngle = noise3(vec3(aAlong * 2.0, 0.0, time * uNoiseSpeed * 0.3)) * 6.2832;
		float swayMag = noise3(vec3(aAlong * 3.0, 1.0, time * uNoiseSpeed * 0.4)) * uNoiseAmp * distortion;
		vec3 swayOffset = vec3(cos(swayAngle) * swayMag, sin(swayAngle) * swayMag, 0.0);

		float localNoise = noise3(position * uNoiseFreq * distortion + time * uNoiseSpeed * 0.5);
		vec3 localOffset = normal * localNoise * uNoiseAmp * 0.3 * distortion;

		vec3 displacedPos = position + swayOffset + localOffset;

		vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);
		vWorldPosition = worldPos.xyz;

		vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
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
	uniform float uGlowIntensity;
	uniform vec3 uGlowColor;
	uniform float uTension;
	uniform float uTimeLoss;

	varying float vAlong;
	varying float vDepth;
	varying vec3 vWorldPosition;

	float hash31(vec3 p) {
		p = fract(p * 0.3183099);
		p *= 17.0;
		return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
	}

	float noise3(vec3 p) {
		vec3 i = floor(p);
		vec3 f = fract(p);
		f = f * f * (3.0 - 2.0 * f);
		return mix(
			mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
				mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
			mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
				mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
			f.z
		);
	}

	void main() {
		if (vAlong > uGrowth) discard;

		float dist = length(vWorldPosition - uCameraPos);
		float maskRadius = 6.0;
		if (dist < maskRadius) discard;

		float darkness = clamp(1.0 - uTimeLoss * 0.05, 0.2, 1.0);
		vec3 base = vec3(0.8, 0.5, 0.1) * darkness;

		float colorNoise = noise3(vWorldPosition * 0.5 + time * 0.05);
		base = mix(base, base * 1.15, colorNoise * 0.4);

		vec3 color = base;
		float pulseBand = 0.0;

		float pulseSpeedMultiplier = 1.0 + uTension * 0.3;

		if (uPulse > 0.5) {
			if (uSpatialWave > 0.5) {
				float cameraZ = uCameraPos.z;
				float cycleTime = 5.0 / pulseSpeedMultiplier;
				float waveOffset = mod(time, cycleTime) * 20.0 * pulseSpeedMultiplier;
				float wavefrontZ = cameraZ - 30.0 + waveOffset;
				float distBelow = vWorldPosition.z - wavefrontZ;
				float pulseLength = 15.0;
				float edgeSoftness = 1.0;
				pulseBand = smoothstep(0.0, edgeSoftness, distBelow)
					* (1.0 - smoothstep(pulseLength, pulseLength + edgeSoftness, distBelow));
			} else {
				float repeat = 2.0;
				float speed = 0.4 * pulseSpeedMultiplier;
				float flow = vAlong * repeat - time * speed;
				float pulse = fract(flow);
				pulseBand = smoothstep(0.0, 0.15, pulse) * smoothstep(1.0, 0.85, pulse);
			}

			vec3 pulseColor = mix(vec3(0.7, 0.35, 0.15), vec3(0.8, 0.1, 0.05), clamp(uTension / 8.0, 0.0, 1.0));
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

		float glowWave = sin(vAlong * 8.0 - time * 1.5 * pulseSpeedMultiplier) * 0.5 + 0.5;
		float glowIntensity = uGlowIntensity * (1.0 + uTension * 0.2);
		vec3 glowColor = mix(uGlowColor, vec3(0.8, 0.1, 0.05), clamp(uTension / 10.0, 0.0, 1.0));
		float glow = glowWave * glowIntensity;
		color += glowColor * glow;

		vec3 fdx = dFdx(vWorldPosition);
		vec3 fdy = dFdy(vWorldPosition);
		vec3 surfNormal = normalize(cross(fdx, fdy));
		vec3 viewDir = normalize(uCameraPos - vWorldPosition);
		float rim = 1.0 - abs(dot(surfNormal, viewDir));
		rim = pow(rim, 2.0) * 0.2;
		color += glowColor * rim;

		float depthFade = exp(-vDepth * 0.04);
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
			uNoiseAmp: { value: 0.5 },
			uNoiseSpeed: { value: 1.0 },
			uNoiseFreq: { value: 1.5 },
			uGlowIntensity: { value: 0.15 },
			uGlowColor: { value: new THREE.Color(0xcd5909) },
			uTension: { value: 0 },
			uTimeLoss: { value: 0 },
		},

		vertexShader: VERTEX_SHADER,
		fragmentShader: FRAGMENT_SHADER,
	});
}
