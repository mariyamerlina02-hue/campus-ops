'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  RotateCw, 
  Eye, 
  Maximize2,
  Activity,
  ChevronRight,
  Plane,
  Building,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  CalendarCheck
} from 'lucide-react';

import campusData from '@/data/campusBuildings.json';
import { maintenanceService } from '@/services/maintenanceService';
import { incidentService } from '@/services/incidentService';
import { resourceService } from '@/services/resourceService';
import { MaintenanceTicket, SecurityIncident, ResourceBooking } from '@/types';

export interface BuildingMetadata {
  id: string;
  name: string;
  category: 'administrative' | 'academic' | 'laboratory' | 'auditorium' | 'sports' | 'monument' | 'walkway';
  department: string;
  floorCount: number;
  coordinates3D: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  architecturalStyle: string;
  droneRefFrames: number[];
  facilities: string[];
  defaultStatus: string;
  approximate: boolean;
}

export type OperationalStatus = 'normal' | 'maintenance' | 'incident' | 'scheduled';

interface BuildingRuntimeStatus {
  status: OperationalStatus;
  incidentCount: number;
  maintenanceCount: number;
  activeBookings: number;
}

const STATUS_CONFIG: Record<OperationalStatus, { label: string; color: string; badge: string; hex: number }> = {
  normal: {
    label: 'Normal Operations',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
    badge: 'bg-emerald-500',
    hex: 0x10b981
  },
  maintenance: {
    label: 'Active Maintenance',
    color: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
    badge: 'bg-amber-500',
    hex: 0xf59e0b
  },
  incident: {
    label: 'Security / SOS Incident',
    color: 'text-rose-400 border-rose-500/30 bg-rose-950/40 animate-pulse',
    badge: 'bg-rose-500',
    hex: 0xf43f5e
  },
  scheduled: {
    label: 'Scheduled Activity / Event',
    color: 'text-sky-400 border-sky-500/30 bg-sky-950/40',
    badge: 'bg-sky-500',
    hex: 0x0ea5e9
  }
};

export default function Campus3DExplorer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const buildingMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());

  const buildings = useMemo(() => campusData.buildings as BuildingMetadata[], []);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingMetadata>(buildings[0]);
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingMetadata | null>(null);
  const [activeFrame, setActiveFrame] = useState<number>(buildings[0].droneRefFrames[0]);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<'drone' | 'ground' | 'front' | 'sports'>('drone');
  const [statusMap, setStatusMap] = useState<Record<string, BuildingRuntimeStatus>>({});
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);

  // Sync active drone frame when selected building changes
  useEffect(() => {
    if (selectedBuilding && selectedBuilding.droneRefFrames.length > 0) {
      setActiveFrame(selectedBuilding.droneRefFrames[0]);
    }
  }, [selectedBuilding]);

  // Load live CampusOps services to compute genuine building operational status
  useEffect(() => {
    let isMounted = true;
    async function fetchOperationalStatus() {
      try {
        const [tickets, incidents, bookings] = await Promise.all([
          maintenanceService.getAll(),
          incidentService.getAll(),
          resourceService.getBookings()
        ]);

        if (!isMounted) return;

        const newStatusMap: Record<string, BuildingRuntimeStatus> = {};

        buildings.forEach(b => {
          const idLower = b.id.toLowerCase();
          const nameLower = b.name.toLowerCase();

          const activeT = tickets.filter(t => 
            (t.building?.toLowerCase().includes(nameLower) || 
             t.building?.toLowerCase().includes(b.department.toLowerCase()) ||
             t.description?.toLowerCase().includes(nameLower) ||
             (b.id === 'MGR-ADMIN-01' && (t.building?.toLowerCase().includes('admin') || t.building?.toLowerCase().includes('anna'))) ||
             (b.id === 'MGR-VOC-03' && (t.building?.toLowerCase().includes('library') || t.building?.toLowerCase().includes('voc'))) ||
             (b.id === 'MGR-SPORTS-04' && (t.building?.toLowerCase().includes('sports') || t.building?.toLowerCase().includes('ground')))) &&
            (t.status === 'reported' || t.status === 'verified_by_hod' || t.status === 'assigned' || t.status === 'in_progress')
          );

          const activeI = incidents.filter(i => 
            (i.location?.toLowerCase().includes(nameLower) ||
             i.description?.toLowerCase().includes(nameLower) ||
             (b.id === 'MGR-ADMIN-01' && i.location?.toLowerCase().includes('admin')) ||
             (b.id === 'MGR-VOC-03' && (i.location?.toLowerCase().includes('academic') || i.location?.toLowerCase().includes('voc'))) ||
             (b.id === 'MGR-SPORTS-04' && i.location?.toLowerCase().includes('court'))) &&
            (i.status === 'open' || i.status === 'dispatched' || i.status === 'investigating')
          );

          const activeB = bookings.filter(bk => 
            (bk.resourceName?.toLowerCase().includes(nameLower) ||
             bk.resourceId?.toLowerCase().includes(idLower) ||
             (b.id === 'MGR-AUD-07' && bk.resourceName?.toLowerCase().includes('auditorium')) ||
             (b.id === 'MGR-KALAM-06' && bk.resourceName?.toLowerCase().includes('lab'))) &&
            bk.status === 'approved'
          );

          let st: OperationalStatus = 'normal';
          if (activeI.length > 0) {
            st = 'incident';
          } else if (activeT.length > 0) {
            st = 'maintenance';
          } else if (activeB.length > 0) {
            st = 'scheduled';
          }

          newStatusMap[b.id] = {
            status: st,
            incidentCount: activeI.length,
            maintenanceCount: activeT.length,
            activeBookings: activeB.length
          };
        });

        setStatusMap(newStatusMap);
      } catch (err) {
        console.warn('CampusOps live digital twin status sync error:', err);
      } finally {
        if (isMounted) setIsLoadingServices(false);
      }
    }

    fetchOperationalStatus();
    return () => { isMounted = false; };
  }, [buildings]);

  // Three.js Scene Setup & Model Loading
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060b14);
    scene.fog = new THREE.FogExp2(0x060b14, 0.006);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 55, 105);

    // 3. Renderer with ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Keep camera above ground
    controls.minDistance = 15;
    controls.maxDistance = 220;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 0.6;
    controls.target.set(0, 4, 0);

    // 5. Natural Sunlight & Environmental Lighting
    const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x1f2937, 0.7);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.95);
    sunLight.position.set(75, 95, 55);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    const d = 90;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    const skyFill = new THREE.DirectionalLight(0x38bdf8, 0.4);
    skyFill.position.set(-60, 45, -50);
    scene.add(skyFill);

    // 6. Base Foundation & Master Plan Grid
    const groundGeo = new THREE.PlaneGeometry(320, 320);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090e17,
      roughness: 0.95,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(260, 52, 0x1e3a8a, 0x0f172a);
    grid.position.y = 0.02;
    scene.add(grid);

    // 7. Load GLB Architectural Model via GLTFLoader
    buildingMeshesRef.current.clear();
    const loader = new GLTFLoader();

    loader.load(
      '/models/mgr_campus_detailed.glb',
      (gltf) => {
        const campusModel = gltf.scene;
        scene.add(campusModel);

        campusModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }

          // Traverse and map named building groups
          if (child.name && child.name.startsWith('BUILDING_')) {
            const bId = child.name.replace('BUILDING_', '');
            const meta = buildings.find(b => b.id === bId);
            if (meta) {
              child.userData = { buildingId: bId, metadata: meta };
              buildingMeshesRef.current.set(bId, child);
            }
          }
        });

        setIsLoadingModel(false);
      },
      undefined,
      (err) => {
        console.warn('Could not load GLB model, falling back to procedural scene:', err);
        setIsLoadingModel(false);
      }
    );

    // 8. Interactive Raycasting for Selection & Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveObjects: THREE.Object3D[] = [];
      buildingMeshesRef.current.forEach(grp => interactiveObjects.push(grp));

      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr && !curr.userData?.buildingId && curr.parent) {
          curr = curr.parent;
        }
        if (curr && curr.userData?.metadata) {
          setHoveredBuilding(curr.userData.metadata);
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredBuilding(null);
      renderer.domElement.style.cursor = 'grab';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveObjects: THREE.Object3D[] = [];
      buildingMeshesRef.current.forEach(grp => interactiveObjects.push(grp));

      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr && !curr.userData?.buildingId && curr.parent) {
          curr = curr.parent;
        }
        if (curr && curr.userData?.metadata) {
          const clickedMeta = curr.userData.metadata as BuildingMetadata;
          setSelectedBuilding(clickedMeta);
          
          // Re-center controls towards the clicked building
          controls.target.set(clickedMeta.coordinates3D.x, 4, clickedMeta.coordinates3D.z);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 9. Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Listener
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointermove', handlePointerMove);
        renderer.domElement.removeEventListener('click', handleClick);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, [buildings, isRotating]);

  // Handle Preset Camera Angles
  const setCameraPreset = (view: 'drone' | 'ground' | 'front' | 'sports') => {
    setCameraView(view);
    if (!controlsRef.current || !cameraRef.current) return;
    const ctrl = controlsRef.current;
    const cam = cameraRef.current;

    switch (view) {
      case 'drone':
        cam.position.set(0, 68, 108);
        ctrl.target.set(0, 4, 0);
        break;
      case 'front':
        cam.position.set(0, 15, 24);
        ctrl.target.set(0, 8, -25);
        break;
      case 'ground':
        cam.position.set(-8, 3.5, 22);
        ctrl.target.set(-18, 5, -12);
        break;
      case 'sports':
        cam.position.set(20, 16, 56);
        ctrl.target.set(20, 2, 24);
        break;
    }
    ctrl.update();
  };

  const currentStatus = statusMap[selectedBuilding.id]?.status || 'normal';
  const statusTheme = STATUS_CONFIG[currentStatus];

  return (
    <div className="relative w-full h-[760px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ORVIAN 3D Digital Twin
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Dr. M.G.R. Educational & Research Institute
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Architectural GLB Model • Maduravoyal Main Campus, Chennai • Photogrammetrically Aligned
          </p>
        </div>

        {/* View Angle Shortcuts */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setCameraPreset('drone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              cameraView === 'drone' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Aerial Drone
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              cameraView === 'front' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin Facade
          </button>
          <button
            onClick={() => setCameraPreset('sports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              cameraView === 'sports' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Athletic Quad
          </button>
          <button
            onClick={() => setCameraPreset('ground')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              cameraView === 'ground' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rocket Plaza
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? 'Pause Orbit' : 'Resume Auto Orbit'}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isRotating ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
        {isLoadingModel && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-30">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-200">Loading Architectural GLB Model...</p>
              <p className="text-xs text-slate-400">Dr. M.G.R. University Main Campus</p>
            </div>
          </div>
        )}
      </div>

      {/* Hover Info Badge Overlay */}
      {hoveredBuilding && hoveredBuilding.id !== selectedBuilding.id && (
        <div className="absolute top-20 left-6 z-20 pointer-events-none bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-blue-500/30 shadow-xl transition-all">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Inspect Location</p>
          <p className="text-sm font-bold text-white">{hoveredBuilding.name}</p>
          <p className="text-xs text-slate-400">{hoveredBuilding.department}</p>
        </div>
      )}

      {/* Left Bottom Floating Digital Twin Operational Status Legend */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 shadow-xl max-w-xs text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            Digital Twin Live State
          </span>
          <span className="text-[10px] text-slate-400 uppercase">
            {isLoadingServices ? 'Syncing...' : 'Live Connected'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Normal Ops</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Active Incident</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Scheduled Act.</span>
          </div>
        </div>
      </div>

      {/* Right Drawer: Selected Building Inspector & Synchronized Drone Footage Panel */}
      <div className="absolute top-20 right-6 bottom-6 w-96 z-20 pointer-events-auto flex flex-col gap-3">
        {/* Selected Building Details Card */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-2xl flex-1 flex flex-col overflow-y-auto">
          {/* Header & Status Indicator */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-bold text-blue-400 tracking-wider uppercase">
                {selectedBuilding.category}
              </span>
              <h3 className="text-base font-bold text-white leading-tight mt-0.5">
                {selectedBuilding.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{selectedBuilding.department}</p>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 whitespace-nowrap ${statusTheme.color}`}>
              <span className={`w-2 h-2 rounded-full ${statusTheme.badge}`} />
              {statusTheme.label}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2.5 my-3.5">
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Building ID</span>
              <p className="text-xs font-mono font-bold text-slate-200 mt-0.5">{selectedBuilding.id}</p>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Floors</span>
              <p className="text-xs font-bold text-slate-200 mt-0.5">
                {selectedBuilding.floorCount > 1 ? `${selectedBuilding.floorCount} Levels` : 'Ground Grounded'}
              </p>
            </div>
          </div>

          {/* Architectural Notes */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 my-1">
            <span className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider block mb-1">
              Architectural Details
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedBuilding.architecturalStyle}
            </p>
          </div>

          {/* Facilities List */}
          <div className="space-y-1.5 my-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Facilities & Key Zones
            </span>
            <div className="space-y-1">
              {selectedBuilding.facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                  <ChevronRight className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live CampusOps Operational Statistics */}
          <div className="mt-auto pt-3 border-t border-slate-800">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
              CampusOps Live Status Integration
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400">Tickets</p>
                <p className="text-xs font-bold text-amber-400">
                  {statusMap[selectedBuilding.id]?.maintenanceCount || 0}
                </p>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400">Incidents</p>
                <p className="text-xs font-bold text-rose-400">
                  {statusMap[selectedBuilding.id]?.incidentCount || 0}
                </p>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400">Bookings</p>
                <p className="text-xs font-bold text-sky-400">
                  {statusMap[selectedBuilding.id]?.activeBookings || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Photogrammetry Reference Synchronized Drone Frame Viewer */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-blue-400" />
              Drone Aerial Frame Calibration
            </span>
            <span className="text-[11px] font-mono text-blue-400">
              Frame {String(activeFrame).padStart(2, '0')}s
            </span>
          </div>

          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`/campus_media/campus_${String(activeFrame).padStart(2, '0')}s.jpg`} 
              alt={`Campus reference frame ${activeFrame}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-slate-300 border border-slate-800">
              Ground Truth Ref • @MGRERI
            </div>
          </div>

          {/* Frame Carousel Thumbnails */}
          {selectedBuilding.droneRefFrames.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {selectedBuilding.droneRefFrames.map(fIdx => (
                <button
                  key={fIdx}
                  onClick={() => setActiveFrame(fIdx)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all ${
                    activeFrame === fIdx 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {String(fIdx).padStart(2, '0')}s
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
