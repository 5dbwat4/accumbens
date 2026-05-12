import * as THREE from '@/utils/404-three-tools/three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { VoxelWorld } from './VoxelWorld.js';
import { getTextVoxels, getPlatformVoxels, getTotalSceneBounds } from './textLayout.js';

const textureFiles = import.meta.glob('./assets/*.png', { eager: true, as: 'url' });

const allTextures = [];
for (const [path, url] of Object.entries(textureFiles)) {
	const name = path.split('/').pop().replace('.png', '');
	if (name === 'bedrock' || name === 'sand') continue;
	allTextures.push({ name, url });
}

const texNameToSlot = {};
const slotUrls = [];
allTextures.forEach(({ name, url }, i) => {
	texNameToSlot[name] = i;
	slotUrls.push(url);
});

function baseName(n) {
	return n.replace(/_top$/, '').replace(/_bottom$/, '').replace(/_side$/, '');
}

const groups = {};
allTextures.forEach(({ name }) => {
	const bn = baseName(name);
	if (!groups[bn]) groups[bn] = {};
	groups[bn][name] = true;
});

const blockTypeSlots = [];
const blockTypeNames = [];
for (const [bn, files] of Object.entries(groups)) {
	const keys = Object.keys(files);

	let sideTexture = bn;
	if (!files[bn]) {
		if (files[bn + '_side']) sideTexture = bn + '_side';
		else if (files[bn + '_top']) sideTexture = bn + '_top';
		else sideTexture = keys[0];
	}

	let topTexture = files[bn + '_top'] ? bn + '_top' : sideTexture;
	let bottomTexture = files[bn + '_bottom'] ? bn + '_bottom' : (files[bn + '_top'] ? bn + '_top' : sideTexture);

	blockTypeSlots.push({
		topSlot: texNameToSlot[topTexture],
		sideSlot: texNameToSlot[sideTexture],
		bottomSlot: texNameToSlot[bottomTexture],
	});
	blockTypeNames.push(bn);
}

const groundNames = ['dirt', 'stone', 'cobblestone', 'gravel', 'cobbled_deepslate',
	'mud', 'rooted_dirt', 'andesite', 'diorite', 'granite', 'tuff', 'deepslate', 'smooth_stone'];
const groundTypeIndices = groundNames
	.map(n => blockTypeNames.indexOf(n) + 1)
	.filter(i => i > 0);

function buildAtlasTexture() {
	const tileSize = 16;
	const count = slotUrls.length;
	const cols = Math.ceil(Math.sqrt(count));
	const rows = Math.ceil(count / cols);

	const canvas = document.createElement('canvas');
	canvas.width = cols * tileSize;
	canvas.height = rows * tileSize;
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#808080';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const texture = new THREE.CanvasTexture(canvas);
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestFilter;
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.flipY = false;

	return { texture, canvas, ctx, tileSize, tileTextureWidth: canvas.width, tileTextureHeight: canvas.height, cols };
}

function drawSlotToAtlas(atlas, slotIndex) {
	return new Promise((resolve) => {
		const url = slotUrls[slotIndex];
		if (!url) { resolve(); return; }

		const img = new Image();
		img.onload = () => {
			const col = slotIndex % atlas.cols;
			const row = Math.floor(slotIndex / atlas.cols);
			atlas.ctx.drawImage(img, col * atlas.tileSize, row * atlas.tileSize, atlas.tileSize, atlas.tileSize);
			atlas.texture.needsUpdate = true;
			resolve();
		};
		img.onerror = () => {
			const col = slotIndex % atlas.cols;
			const row = Math.floor(slotIndex / atlas.cols);
			atlas.ctx.fillStyle = `hsl(${slotIndex * 37 % 360}, 60%, 50%)`;
			atlas.ctx.fillRect(col * atlas.tileSize, row * atlas.tileSize, atlas.tileSize, atlas.tileSize);
			atlas.texture.needsUpdate = true;
			resolve();
		};
		img.src = url;
	});
}

const neighborOffsets = [
	[0, 0, 0],
	[-1, 0, 0], [1, 0, 0],
	[0, -1, 0], [0, 1, 0],
	[0, 0, -1], [0, 0, 1],
];

export default async function main(canvas) {
	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(canvas.clientWidth || 800, canvas.clientHeight || 500, false);

	const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 500);
	camera.position.set(12, 8, 14);

	const scene = new THREE.Scene();

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
	scene.add(ambientLight);

	const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
	dirLight.position.set(30, 40, 20);
	scene.add(dirLight);

	const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
	dirLight2.position.set(-10, 10, -10);
	scene.add(dirLight2);

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.dampingFactor = 0.1;

	const bounds = getTotalSceneBounds();
	controls.target.set(
		bounds.totalW / 2,
		bounds.maxY / 2,
		bounds.charDepth / 2
	);
	controls.update();

	const atlas = buildAtlasTexture();
	await Promise.all(slotUrls.map((_, i) => drawSlotToAtlas(atlas, i)));

	const material = new THREE.MeshLambertMaterial({
		map: atlas.texture,
		side: THREE.DoubleSide,
		alphaTest: 0.1,
		transparent: true,
	});

	const cellSize = 32;
	const world = new VoxelWorld({
		cellSize,
		tileSize: atlas.tileSize,
		tileTextureWidth: atlas.tileTextureWidth,
		tileTextureHeight: atlas.tileTextureHeight,
		atlasCols: atlas.cols,
		blockTypeSlots,
	});

	const cellIdToMesh = {};

	function updateCellGeometry(x, y, z) {
		const cellX = Math.floor(x / cellSize);
		const cellY = Math.floor(y / cellSize);
		const cellZ = Math.floor(z / cellSize);
		const cellId = world.computeCellId(x, y, z);
		let mesh = cellIdToMesh[cellId];
		const geometry = mesh ? mesh.geometry : new THREE.BufferGeometry();

		const { positions, normals, uvs, indices } = world.generateGeometryDataForCell(cellX, cellY, cellZ);
		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
		geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
		geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
		geometry.setIndex(indices);
		geometry.computeBoundingSphere();

		if (!mesh) {
			mesh = new THREE.Mesh(geometry, material);
			mesh.name = cellId;
			cellIdToMesh[cellId] = mesh;
			scene.add(mesh);
			mesh.position.set(cellX * cellSize, cellY * cellSize, cellZ * cellSize);
		}
	}

	function updateVoxelGeometry(x, y, z) {
		const updatedCellIds = {};
		for (const offset of neighborOffsets) {
			const ox = x + offset[0];
			const oy = y + offset[1];
			const oz = z + offset[2];
			const cellId = world.computeCellId(ox, oy, oz);
			if (!updatedCellIds[cellId]) {
				updatedCellIds[cellId] = true;
				updateCellGeometry(ox, oy, oz);
			}
		}
	}

	function randInt(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	const numTypes = blockTypeSlots.length;

	const textVoxels = getTextVoxels(0, 3, 0);
	for (const { x, y, z } of textVoxels) {
		world.setVoxel(x, y, z, randInt(1, numTypes + 1));
	}

	const plat = getPlatformVoxels(-2, bounds.totalW + 1, -2, bounds.charDepth + 1, 0);
	for (const { x, y, z } of plat) {
		world.setVoxel(x, y, z, groundTypeIndices[randInt(0, groundTypeIndices.length)]);
	}

	for (let y = 0; y < bounds.maxY; y++) {
		for (let x = -2; x < bounds.totalW + 2; x++) {
			for (let z = -2; z < bounds.charDepth + 2; z++) {
				if (world.getVoxel(x, y, z)) {
					updateVoxelGeometry(x, y, z);
				}
			}
		}
	}

	const rollOverGeo = new THREE.BoxGeometry(1, 1, 1);
	const rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.4, transparent: true });
	const rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
	rollOverMesh.visible = false;
	scene.add(rollOverMesh);

	function resizeRendererToDisplaySize() {
		const c = renderer.domElement;
		const w = c.clientWidth || 800;
		const h = c.clientHeight || 500;
		const needResize = c.width !== w || c.height !== h;
		if (needResize) {
			renderer.setSize(w, h, false);
		}
		return needResize;
	}

	let renderRequested = false;
	function requestRenderIfNotRequested() {
		if (!renderRequested) {
			renderRequested = true;
			requestAnimationFrame(render);
		}
	}

	function render() {
		renderRequested = false;

		if (resizeRendererToDisplaySize()) {
			const c = renderer.domElement;
			camera.aspect = c.clientWidth / c.clientHeight;
			camera.updateProjectionMatrix();
		}

		controls.update();
		renderer.render(scene, camera);
	}

	render();
	requestAnimationFrame(render);

	const mouse = { x: 0, y: 0, moveX: 0, moveY: 0 };

	function getCanvasRelativePosition(event) {
		const rect = canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * canvas.width / rect.width,
			y: (event.clientY - rect.top) * canvas.height / rect.height,
		};
	}

	function intersectVoxel(event) {
		const pos = getCanvasRelativePosition(event);
		const x = (pos.x / canvas.width) * 2 - 1;
		const y = (pos.y / canvas.height) * -2 + 1;
		const start = new THREE.Vector3();
		const end = new THREE.Vector3();
		start.setFromMatrixPosition(camera.matrixWorld);
		end.set(x, y, 1).unproject(camera);
		return world.intersectRay(start, end);
	}

	function placeVoxel(event) {
		const intersection = intersectVoxel(event);
		if (!intersection) return;

		const type = randInt(1, numTypes + 1);
		const pos = intersection.position.map((v, ndx) =>
			v + intersection.normal[ndx] * 0.5
		);
		const px = Math.floor(pos[0]);
		const py = Math.floor(pos[1]);
		const pz = Math.floor(pos[2]);
		world.setVoxel(px, py, pz, type);
		updateVoxelGeometry(px, py, pz);
	}

	function removeVoxel(event) {
		const intersection = intersectVoxel(event);
		if (!intersection) return;

		const pos = intersection.position.map((v, ndx) =>
			v + intersection.normal[ndx] * -0.5
		);
		const px = Math.floor(pos[0]);
		const py = Math.floor(pos[1]);
		const pz = Math.floor(pos[2]);
		world.setVoxel(px, py, pz, 0);
		updateVoxelGeometry(px, py, pz);
	}

	function showRollOver(event) {
		const intersection = intersectVoxel(event);
		if (!intersection) {
			rollOverMesh.visible = false;
			requestRenderIfNotRequested();
			return;
		}
		const pos = intersection.position.map((v, ndx) =>
			v + intersection.normal[ndx] * 0.5
		);
		rollOverMesh.position.set(
			Math.floor(pos[0]) + 0.5,
			Math.floor(pos[1]) + 0.5,
			Math.floor(pos[2]) + 0.5
		);
		rollOverMesh.visible = true;
		requestRenderIfNotRequested();
	}

	function recordStartPosition(event) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
		mouse.moveX = 0;
		mouse.moveY = 0;
	}

	function recordMovement(event) {
		mouse.moveX += Math.abs(mouse.x - event.clientX);
		mouse.moveY += Math.abs(mouse.y - event.clientY);
	}

	function onPointerUp(event) {
		if (mouse.moveX < 5 && mouse.moveY < 5) {
			if (event.button === 0) {
				placeVoxel(event);
			} else if (event.button === 2) {
				removeVoxel(event);
			}
			requestRenderIfNotRequested();
		}
		window.removeEventListener('pointermove', recordMovement);
		window.removeEventListener('pointerup', onPointerUp);
	}

	canvas.addEventListener('pointerdown', (event) => {
		event.preventDefault();
		recordStartPosition(event);
		window.addEventListener('pointermove', recordMovement);
		window.addEventListener('pointerup', onPointerUp);
	});

	canvas.addEventListener('pointermove', (event) => {
		showRollOver(event);
	});

	canvas.addEventListener('contextmenu', (event) => {
		event.preventDefault();
	});

	controls.addEventListener('start', () => {
		rollOverMesh.visible = false;
	});
	controls.addEventListener('change', requestRenderIfNotRequested);
	window.addEventListener('resize', requestRenderIfNotRequested);
}
