/**
 * M.G.R. Educational and Research Institute - Detailed 3D Architectural Model Generator
 * Generates an accurate, high-poly PBR GLB model of Dr. M.G.R. Campus (Maduravoyal, Chennai)
 * Built using Three.js & GLTFExporter in Node.js
 */

const fs = require('fs');
const path = require('path');

// Set up mock browser globals needed by GLTFExporter in Node.js
global.window = global;
global.self = global;
global.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    if (blob.arrayBuffer) {
      blob.arrayBuffer().then(buf => {
        this.result = buf;
        if (this.onload) this.onload({ target: { result: buf } });
        if (this.onloadend) this.onloadend({ target: { result: buf } });
      });
    }
  }
};

const THREE = require('../node_modules/three');
const { GLTFExporter } = require('../node_modules/three/examples/jsm/exporters/GLTFExporter.js');

console.log('Generating Dr. M.G.R. Educational and Research Institute 3D Digital Twin...');

const scene = new THREE.Scene();
scene.name = "MGR_University_Campus";

// ==========================================
// PBR MATERIAL DEFINITIONS (Ground Truth MGR Palette)
// ==========================================
const materials = {
  // Reflective Teal Glass Curtain Wall (Admin Block) - standard PBR for universal browser compatibility
  tealGlass: new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.35,
    transparent: true,
    opacity: 0.75,
    name: "Teal_Curtain_Glass"
  }),
  // Dark Window Mullions & Window Frames
  windowFrame: new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.45,
    metalness: 0.7,
    name: "Window_Frame_Metal"
  }),
  // Signature MGR Orange (5 rooftop canopies, auditorium canopy)
  mgrOrange: new THREE.MeshStandardMaterial({
    color: 0xea580c,
    roughness: 0.35,
    metalness: 0.15,
    name: "MGR_Orange_Accent"
  }),
  // University Facade Yellow (Entrance portals, VOC Block)
  mgrYellow: new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.45,
    metalness: 0.05,
    name: "MGR_Yellow_Facade"
  }),
  // White Balustrades & Precast Concrete Railings
  whiteConcrete: new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.5,
    metalness: 0.05,
    name: "White_Balustrade_Concrete"
  }),
  // Dark Architectural Concrete & Plinths
  slateConcrete: new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.75,
    metalness: 0.1,
    name: "Foundation_Plinth"
  }),
  // Terracotta & Buff Pavers (Promenade & Plaza)
  paverTerracotta: new THREE.MeshStandardMaterial({
    color: 0xc2410c,
    roughness: 0.85,
    metalness: 0.02,
    name: "Terracotta_Pavers"
  }),
  // Asphalt Roads
  asphalt: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.9,
    metalness: 0.05,
    name: "Campus_Road_Asphalt"
  }),
  // Dual-Color Sports Courts
  sportsRed: new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.7,
    name: "Sports_Court_Red"
  }),
  sportsCyan: new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.6,
    name: "Sports_Court_Cyan"
  }),
  // Rocket Monument PBR Materials
  rocketWhite: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.3,
    name: "Rocket_Body_White"
  }),
  rocketOrange: new THREE.MeshStandardMaterial({
    color: 0xc2410c,
    roughness: 0.3,
    metalness: 0.2,
    name: "Rocket_Fairing_Orange"
  }),
  // Foliage
  palmTrunk: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85, name: "Palm_Trunk" }),
  palmLeaf: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, name: "Palm_Foliage" }),
  trunkRingYellow: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5, name: "Trunk_Ring_Yellow" }),
  trunkRingGreen: new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5, name: "Trunk_Ring_Green" })
};

// ==========================================
// 1. RECONSTRUCT REAL BUILDING 1: MAIN ADMINISTRATIVE & ENGINEERING BLOCK (Anna Block)
// ==========================================
const adminGroup = new THREE.Group();
adminGroup.name = "BUILDING_MGR-ADMIN-01";
adminGroup.userData = { id: "MGR-ADMIN-01", name: "Main Administrative & Engineering Block" };

// Foundation Plinth & Stairs
const adminPlinth = new THREE.Mesh(new THREE.BoxGeometry(52, 1.4, 20), materials.slateConcrete);
adminPlinth.position.set(0, 0.7, 0);
adminPlinth.castShadow = true;
adminPlinth.receiveShadow = true;
adminGroup.add(adminPlinth);

// Main 5-Story Glass Curtain Wall Body
const bWidth = 48;
const bHeight = 17;
const bDepth = 15;
const floorCount = 5;
const floorHeight = bHeight / floorCount;

// Structural Core Backing
const coreMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth - 1, bHeight, bDepth - 1), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 }));
coreMesh.position.set(0, bHeight / 2 + 1.4, 0);
adminGroup.add(coreMesh);

// Curtain Wall Glass Panels per Floor
for (let floor = 0; floor < floorCount; floor++) {
  const yPos = 1.4 + (floor * floorHeight) + (floorHeight / 2);

  // Front & Back Glass Facades
  const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(bWidth, floorHeight * 0.85, 0.4), materials.tealGlass);
  frontGlass.position.set(0, yPos, bDepth / 2 + 0.2);
  adminGroup.add(frontGlass);

  const backGlass = new THREE.Mesh(new THREE.BoxGeometry(bWidth, floorHeight * 0.85, 0.4), materials.tealGlass);
  backGlass.position.set(0, yPos, -bDepth / 2 - 0.2);
  adminGroup.add(backGlass);

  // Horizontal Floor Spandrel Ribs
  const spandrelFront = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.6, floorHeight * 0.15, 0.8), materials.windowFrame);
  spandrelFront.position.set(0, 1.4 + (floor * floorHeight) + (floorHeight * 0.92), bDepth / 2 + 0.2);
  adminGroup.add(spandrelFront);

  // Vertical Window Mullions (12 mullions per floor)
  for (let m = -5; m <= 5; m++) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.25, floorHeight * 0.85, 0.6), materials.windowFrame);
    mullion.position.set(m * 4.2, yPos, bDepth / 2 + 0.25);
    adminGroup.add(mullion);
  }
}

// Double-Height Grand Yellow Entrance Portal (Frames 00s-08s)
const portalYellow = new THREE.Mesh(new THREE.BoxGeometry(14, 7.5, 3), materials.mgrYellow);
portalYellow.position.set(0, 4.4, bDepth / 2 + 1.6);
adminGroup.add(portalYellow);

// Entrance Recessed Void & Sliding Doors
const entranceGlass = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.4), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, transparent: true, opacity: 0.8 }));
entranceGlass.position.set(0, 3.2, bDepth / 2 + 2.8);
adminGroup.add(entranceGlass);

// Grand Entrance Stairs
for (let s = 1; s <= 4; s++) {
  const step = new THREE.Mesh(new THREE.BoxGeometry(16 + (s * 1.5), 0.35, 1.2), materials.slateConcrete);
  step.position.set(0, 1.4 - (s * 0.35), bDepth / 2 + 3 + (s * 1.1));
  adminGroup.add(step);
}

// 5 Distinctive Geometric Orange Cubic Rooftop Canopies
const cubeSpacing = [-18, -9, 0, 9, 18];
cubeSpacing.forEach((xOffset, idx) => {
  const cubeGroup = new THREE.Group();
  cubeGroup.name = `Admin_Roof_Canopy_${idx + 1}`;

  const orangeCube = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.6, 4.5), materials.mgrOrange);
  orangeCube.position.set(xOffset, 1.4 + bHeight + 1.8, 0);
  orangeCube.castShadow = true;
  adminGroup.add(orangeCube);

  // Cube Accent Glass Cutout (Front Facing)
  const cubeGlass = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 0.2), materials.tealGlass);
  cubeGlass.position.set(xOffset, 1.4 + bHeight + 1.8, 2.3);
  adminGroup.add(cubeGlass);
});

// Roof Parapet Perimeter Wall
const parapetFront = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.8, 1.2, 0.5), materials.slateConcrete);
parapetFront.position.set(0, 1.4 + bHeight + 0.6, bDepth / 2 + 0.25);
adminGroup.add(parapetFront);

const parapetBack = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.8, 1.2, 0.5), materials.slateConcrete);
parapetBack.position.set(0, 1.4 + bHeight + 0.6, -bDepth / 2 - 0.25);
adminGroup.add(parapetBack);

// Position Admin Block in Campus Grid
adminGroup.position.set(0, 0, -25);
scene.add(adminGroup);

// ==========================================
// 2. ISRO PSLV SPACE LAUNCH MONUMENT & PLAZA (Frames 00s-08s)
// ==========================================
const rocketGroup = new THREE.Group();
rocketGroup.name = "BUILDING_MGR-ROCKET-02";
rocketGroup.userData = { id: "MGR-ROCKET-02", name: "ISRO PSLV Space Launch Monument" };

// Tiered Hexagonal Pedestal
const ped1 = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 0.8, 6), materials.slateConcrete);
ped1.position.set(0, 0.4, 0);
rocketGroup.add(ped1);

const ped2 = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 0.8, 6), materials.whiteConcrete);
ped2.position.set(0, 1.2, 0);
rocketGroup.add(ped2);

// Core Multi-Stage Rocket
const coreStage1 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 6, 24), materials.rocketWhite);
coreStage1.position.set(0, 4.6, 0);
rocketGroup.add(coreStage1);

// Interstage Ring
const interstage1 = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.4, 24), materials.windowFrame);
interstage1.position.set(0, 7.8, 0);
rocketGroup.add(interstage1);

const coreStage2 = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 5.5, 24), materials.rocketWhite);
coreStage2.position.set(0, 10.75, 0);
rocketGroup.add(coreStage2);

// Conical Payload Fairing
const payloadCone = new THREE.Mesh(new THREE.ConeGeometry(0.88, 3.2, 24), materials.rocketOrange);
payloadCone.position.set(0, 15.1, 0);
rocketGroup.add(payloadCone);

// 4 Solid Strap-On Boosters
const boosterOffsets = [[1.35, 0], [-1.35, 0], [0, 1.35], [0, -1.35]];
boosterOffsets.forEach(([bx, bz]) => {
  const booster = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 5.5, 16), materials.rocketWhite);
  booster.position.set(bx, 4.5, bz);
  rocketGroup.add(booster);

  const boosterNose = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.1, 16), materials.rocketOrange);
  boosterNose.position.set(bx, 7.8, bz);
  rocketGroup.add(boosterNose);
});

rocketGroup.position.set(-18, 0, -12);
scene.add(rocketGroup);

// ==========================================
// 3. V.O.C. ACADEMIC COMPLEX & CENTRAL LIBRARY (Frames 09s-13s & 20s-22s)
// ==========================================
const vocGroup = new THREE.Group();
vocGroup.name = "BUILDING_MGR-VOC-03";
vocGroup.userData = { id: "MGR-VOC-03", name: "V.O.C. Academic Complex & Central Library" };

// 6-Story Yellow Facade Body
const vocWidth = 34;
const vocHeight = 21;
const vocDepth = 22;
const vocMain = new THREE.Mesh(new THREE.BoxGeometry(vocWidth, vocHeight, vocDepth), materials.mgrYellow);
vocMain.position.set(0, vocHeight / 2, 0);
vocGroup.add(vocMain);

// White Balconies and Balustrades per Floor
for (let f = 1; f <= 5; f++) {
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(vocWidth + 0.8, 0.7, vocDepth + 0.8), materials.whiteConcrete);
  balcony.position.set(0, f * 3.8, 0);
  vocGroup.add(balcony);

  // Recessed Windows
  for (let w = -3; w <= 3; w++) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.3), materials.windowFrame);
    win.position.set(w * 4.4, f * 3.8 + 1.4, vocDepth / 2 + 0.1);
    vocGroup.add(win);
  }
}

// "VOC BLOCK" Yellow Signboard Parapet
const vocSign = new THREE.Mesh(new THREE.BoxGeometry(18, 2.8, 0.8), materials.mgrYellow);
vocSign.position.set(0, vocHeight + 1.4, vocDepth / 2 + 0.3);
vocGroup.add(vocSign);

vocGroup.position.set(-28, 0, 18);
scene.add(vocGroup);

// ==========================================
// 4. SYNTHETIC DUAL-COLOR SPORTS ARENA (Frames 20s-27s)
// ==========================================
const sportsGroup = new THREE.Group();
sportsGroup.name = "BUILDING_MGR-SPORTS-04";
sportsGroup.userData = { id: "MGR-SPORTS-04", name: "Outdoor Athletic Arena & Synthetic Courts" };

// Outer Red Court
const outerCourt = new THREE.Mesh(new THREE.BoxGeometry(28, 0.25, 20), materials.sportsRed);
outerCourt.position.set(0, 0.12, 0);
sportsGroup.add(outerCourt);

// Inner Cyan Playing Area
const innerCourt = new THREE.Mesh(new THREE.BoxGeometry(20, 0.28, 12), materials.sportsCyan);
innerCourt.position.set(0, 0.14, 0);
sportsGroup.add(innerCourt);

// Safety Perimeter Chain-Link Wireframe
const sportsFence = new THREE.Mesh(new THREE.BoxGeometry(28.6, 3.8, 20.6), new THREE.MeshStandardMaterial({
  color: 0x64748b,
  wireframe: true
}));
sportsFence.position.set(0, 2.0, 0);
sportsGroup.add(sportsFence);

sportsGroup.position.set(20, 0, 24);
scene.add(sportsGroup);

// ==========================================
// 5. ROYAL PALM PROMENADE & CEREMONIAL PLAZA (Frames 14s-19s)
// ==========================================
const plazaGroup = new THREE.Group();
plazaGroup.name = "BUILDING_MGR-PROMENADE-05";
plazaGroup.userData = { id: "MGR-PROMENADE-05", name: "Royal Palm Avenue & Ceremonial Plaza" };

const plazaFloor = new THREE.Mesh(new THREE.BoxGeometry(52, 0.2, 26), materials.paverTerracotta);
plazaFloor.position.set(0, 0.1, 0);
plazaGroup.add(plazaFloor);

// 12 Royal Palms with Yellow/Green Trunk Rings
const palmCoords = [
  [-22, 10], [-14, 10], [-6, 10], [6, 10], [14, 10], [22, 10],
  [-22, -10], [-14, -10], [-6, -10], [6, -10], [14, -10], [22, -10]
];

palmCoords.forEach(([px, pz]) => {
  // Yellow Base Ring
  const rY = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.6, 12), materials.trunkRingYellow);
  rY.position.set(px, 0.4, pz);
  plazaGroup.add(rY);

  // Green Second Ring
  const rG = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.6, 12), materials.trunkRingGreen);
  rG.position.set(px, 1.0, pz);
  plazaGroup.add(rG);

  // Palm Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 8, 12), materials.palmTrunk);
  trunk.position.set(px, 5.0, pz);
  plazaGroup.add(trunk);

  // Palm Foliage Canopy
  const crown = new THREE.Mesh(new THREE.ConeGeometry(2.6, 2.4, 8), materials.palmLeaf);
  crown.position.set(px, 9.4, pz);
  plazaGroup.add(crown);
});

plazaGroup.position.set(0, 0, 4);
scene.add(plazaGroup);

// ==========================================
// 6. DR. A.P.J. ABDUL KALAM COMPUTING & AI CENTRE
// ==========================================
const kalamGroup = new THREE.Group();
kalamGroup.name = "BUILDING_MGR-KALAM-06";
kalamGroup.userData = { id: "MGR-KALAM-06", name: "Dr. A.P.J. Abdul Kalam Computing & AI Centre" };

const kalamBody = new THREE.Mesh(new THREE.BoxGeometry(30, 19, 19), materials.slateConcrete);
kalamBody.position.set(0, 9.5, 0);
kalamGroup.add(kalamBody);

const kalamGlass = new THREE.Mesh(new THREE.BoxGeometry(30.4, 15, 2), materials.tealGlass);
kalamGlass.position.set(0, 9.5, 9);
kalamGroup.add(kalamGlass);

kalamGroup.position.set(30, 0, -12);
scene.add(kalamGroup);

// ==========================================
// 7. A.C.S. CONVENTION CENTRE & AUDITORIUM
// ==========================================
const audGroup = new THREE.Group();
audGroup.name = "BUILDING_MGR-AUD-07";
audGroup.userData = { id: "MGR-AUD-07", name: "A.C.S. Convention Centre & Auditorium" };

const audBody = new THREE.Mesh(new THREE.BoxGeometry(36, 15, 26), materials.slateConcrete);
audBody.position.set(0, 7.5, 0);
audGroup.add(audBody);

const audCanopy = new THREE.Mesh(new THREE.BoxGeometry(26, 0.9, 9), materials.mgrOrange);
audCanopy.position.set(0, 6.5, 15.5);
audGroup.add(audCanopy);

audGroup.position.set(-32, 0, -16);
scene.add(audGroup);

// ==========================================
// CAMPUS ROADS & INFRASTRUCTURE
// ==========================================
const road1 = new THREE.Mesh(new THREE.PlaneGeometry(16, 150), materials.asphalt);
road1.rotation.x = -Math.PI / 2;
road1.position.set(0, 0.05, 10);
scene.add(road1);

const road2 = new THREE.Mesh(new THREE.PlaneGeometry(150, 14), materials.asphalt);
road2.rotation.x = -Math.PI / 2;
road2.position.set(0, 0.06, -8);
scene.add(road2);

// ==========================================
// EXPORT TO PRODUCTION GLB
// ==========================================
const outputPath = path.resolve(__dirname, '../public/models/mgr_campus_detailed.glb');
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const exporter = new GLTFExporter();
exporter.parse(
  scene,
  function (glb) {
    fs.writeFileSync(outputPath, Buffer.from(glb));
    console.log(`✅ Successfully generated detailed M.G.R. Campus GLB: ${outputPath}`);
    console.log(`   File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
  },
  function (error) {
    console.error('❌ Error exporting GLTF:', error);
  },
  { binary: true }
);
