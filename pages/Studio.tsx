
import React, { useEffect, useRef, useState } from 'react';
import { Save, Play, MousePointer2, Box, Trash2, Monitor, AlertTriangle, Hammer, Palette, Layers, ChevronRight, Settings, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

const COLORS = [
  '#9ca3af', // Concrete
  '#ef4444', // Red Neon
  '#3b82f6', // Blue Plastic
  '#16a34a', // Grass
  '#eab308', // Wood
  '#000000', // Obsidian
  '#ffffff', // Snow
  '#8b5cf6', // Magic
];

const Studio: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'select' | 'move' | 'delete'>('select');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [objectCount, setObjectCount] = useState(0);
  
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const objectsRef = useRef<THREE.Mesh[]>([]);

  // Check for Mobile Device
  useEffect(() => {
    const checkDevice = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Initialize Three.js Editor
  useEffect(() => {
    if (isMobile || !mountRef.current) return;

    // Setup
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); // Dark Studio Background
    scene.fog = new THREE.Fog(0x222222, 20, 100);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Grid (The "Baseplate")
    const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x333333);
    scene.add(gridHelper);

    // Plane for Raycasting (Invisible floor)
    const planeGeo = new THREE.PlaneGeometry(100, 100);
    const planeMat = new THREE.MeshBasicMaterial({ visible: false });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    objectsRef.current = [plane];

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isMouseDown = false;

    // Tools Logic
    const onMouseDown = (event: MouseEvent) => {
      // Don't trigger if clicking on UI
      if ((event.target as HTMLElement).tagName !== 'CANVAS') return;
      
      isMouseDown = true;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objectsRef.current);

      if (intersects.length > 0) {
        const intersect = intersects[0];

        // ADD BLOCK (If tool is select/move for now we just add, simple voxel logic)
        if (selectedTool === 'select' || selectedTool === 'move') {
            const voxel = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: selectedColor })
            );
            voxel.castShadow = true;
            voxel.receiveShadow = true;
            
            // Snap to grid
            if (intersect.face) {
                voxel.position.copy(intersect.point).add(intersect.face.normal);
                voxel.position.divideScalar(1).floor().multiplyScalar(1).addScalar(0.5);
                scene.add(voxel);
                objectsRef.current.push(voxel);
                setObjectCount(prev => prev + 1);
            }
        }
        // DELETE BLOCK
        else if (selectedTool === 'delete') {
            if (intersect.object !== plane) {
                scene.remove(intersect.object);
                objectsRef.current = objectsRef.current.filter(obj => obj !== intersect.object);
                setObjectCount(prev => prev - 1);
            }
        }
      }
    };

    window.addEventListener('mousedown', onMouseDown);

    // Camera Controls (Simple Orbit-like logic using mouse right click or alt key would be complex, 
    // for this demo we just rotate camera slowly to show it's 3D)
    let angle = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        // Simple rotation if not interacting (to keep scene alive)
        // In a real app we'd add OrbitControls
        renderer.render(scene, camera);
    };
    animate();

    return () => {
        window.removeEventListener('mousedown', onMouseDown);
        if (mountRef.current) mountRef.current.innerHTML = '';
        renderer.dispose();
    };

  }, [isMobile, selectedColor, selectedTool]); // Re-run if tool changes to update closure

  // --- MOBILE VIEW ---
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="bg-[#2d2d2d] border border-gray-700 p-8 rounded-2xl shadow-2xl max-w-md">
            <Monitor className="w-24 h-24 text-gray-500 mx-auto mb-6" />
            <h1 className="text-2xl font-extrabold text-white mb-4">Studio Available on PC Only</h1>
            <p className="text-gray-400 mb-6">
                BloxClone Studio is a powerful development tool designed for mouse and keyboard. 
                Please open this page on your computer to start building your own experiences!
            </p>
            
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg text-left">
                    <AlertTriangle className="text-yellow-500 w-6 h-6 shrink-0" />
                    <span className="text-sm text-gray-300">Touch screens are not supported for the level editor.</span>
                </div>
            </div>

            <Link to="/" className="mt-8 block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                Return to Home
            </Link>
        </div>
      </div>
    );
  }

  // --- DESKTOP STUDIO UI ---
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#1e1e1e] text-white font-sans select-none">
        
        {/* Top Menu Bar */}
        <div className="h-10 bg-[#2d2d2d] border-b border-[#111] flex items-center justify-between px-2">
            <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-blue-600 flex items-center justify-center mr-2 rounded-sm">
                    <div className="w-4 h-4 border-2 border-white rotate-45 rounded-[1px]"></div>
                </div>
                <button className="px-3 py-1 hover:bg-[#3d3d3d] rounded text-sm text-gray-300">File</button>
                <button className="px-3 py-1 hover:bg-[#3d3d3d] rounded text-sm text-gray-300">Home</button>
                <button className="px-3 py-1 hover:bg-[#3d3d3d] rounded text-sm text-gray-300">Model</button>
                <button className="px-3 py-1 hover:bg-[#3d3d3d] rounded text-sm text-gray-300">View</button>
                <button className="px-3 py-1 hover:bg-[#3d3d3d] rounded text-sm text-gray-300">Plugins</button>
            </div>
            <div className="text-xs text-gray-500 font-mono">BloxClone Studio 2025</div>
        </div>

        {/* Toolbar */}
        <div className="h-14 bg-[#363636] border-b border-[#111] flex items-center px-4 gap-4 shadow-md z-10">
            <div className="flex items-center gap-1 bg-[#222] p-1 rounded">
                <button 
                    onClick={() => setSelectedTool('select')}
                    className={`p-2 rounded ${selectedTool === 'select' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#444]'}`} title="Select/Place">
                    <MousePointer2 className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setSelectedTool('move')}
                    className={`p-2 rounded ${selectedTool === 'move' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#444]'}`} title="Move">
                    <Hammer className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setSelectedTool('delete')}
                    className={`p-2 rounded ${selectedTool === 'delete' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-[#444]'}`} title="Delete">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="w-px h-8 bg-[#555]"></div>

            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {COLORS.map(c => (
                        <button 
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={`w-6 h-6 rounded border border-gray-500 hover:scale-110 transition-transform ${selectedColor === c ? 'ring-2 ring-white' : ''}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
                 <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded flex items-center gap-2 font-bold text-sm shadow-sm">
                    <Play className="w-4 h-4 fill-current" /> Play
                 </button>
                 <Link to="/" className="bg-[#444] hover:bg-[#555] text-white px-4 py-1.5 rounded font-bold text-sm border border-[#555]">
                    Exit
                 </Link>
            </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
            {/* Toolbox (Left) */}
            <div className="w-64 bg-[#2d2d2d] border-r border-[#111] flex flex-col">
                <div className="p-2 border-b border-[#111] font-bold text-xs uppercase text-gray-400 flex justify-between">
                    <span>Toolbox</span>
                    <Search className="w-4 h-4" />
                </div>
                <div className="p-2 grid grid-cols-3 gap-2 overflow-y-auto">
                    {['Part', 'Sphere', 'Wedge', 'Cylinder', 'Corner', 'Truss', 'Seat', 'Spawn'].map(item => (
                        <button key={item} className="aspect-square bg-[#1e1e1e] border border-[#444] rounded hover:border-white flex flex-col items-center justify-center gap-1 group">
                            <Box className="w-6 h-6 text-gray-500 group-hover:text-blue-400" />
                            <span className="text-[10px] text-gray-400">{item}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3D Viewport */}
            <div className="flex-1 relative bg-black">
                <div ref={mountRef} className="w-full h-full cursor-crosshair" />
                
                {/* Viewport Overlay */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded font-mono pointer-events-none">
                    Parts: {objectCount}
                </div>
            </div>

            {/* Explorer & Properties (Right) */}
            <div className="w-72 bg-[#2d2d2d] border-l border-[#111] flex flex-col">
                {/* Explorer */}
                <div className="h-1/2 border-b border-[#111] flex flex-col">
                    <div className="p-2 bg-[#363636] text-xs font-bold text-white flex items-center justify-between">
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> Explorer</span>
                    </div>
                    <div className="flex-1 p-2 overflow-y-auto text-sm text-gray-300 font-mono">
                        <div className="flex items-center gap-1 hover:bg-[#444] px-1 rounded cursor-pointer">
                            <ChevronRight className="w-3 h-3" /> 
                            <span className="font-bold">Workspace</span>
                        </div>
                        <div className="pl-4">
                            <div className="flex items-center gap-1 hover:bg-[#444] px-1 rounded cursor-pointer text-gray-400">
                                <Box className="w-3 h-3" /> Camera
                            </div>
                            <div className="flex items-center gap-1 hover:bg-[#444] px-1 rounded cursor-pointer text-gray-400">
                                <Box className="w-3 h-3" /> Baseplate
                            </div>
                            {Array.from({length: Math.min(objectCount, 10)}).map((_, i) => (
                                <div key={i} className="flex items-center gap-1 hover:bg-[#444] px-1 rounded cursor-pointer text-blue-300">
                                    <Box className="w-3 h-3" /> Part
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Properties */}
                <div className="h-1/2 flex flex-col">
                    <div className="p-2 bg-[#363636] text-xs font-bold text-white flex items-center justify-between">
                        <span className="flex items-center gap-1"><Settings className="w-3 h-3" /> Properties</span>
                    </div>
                    <div className="p-3 text-xs text-gray-400 space-y-2">
                        <div className="grid grid-cols-2 border-b border-[#444] pb-1">
                            <span>Color</span>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{background: selectedColor}}></div>
                                <span>{selectedColor}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 border-b border-[#444] pb-1">
                            <span>Material</span>
                            <span>Plastic</span>
                        </div>
                        <div className="grid grid-cols-2 border-b border-[#444] pb-1">
                            <span>Transparency</span>
                            <span>0</span>
                        </div>
                        <div className="grid grid-cols-2 border-b border-[#444] pb-1">
                            <span>Reflectance</span>
                            <span>0</span>
                        </div>
                        <div className="grid grid-cols-2 border-b border-[#444] pb-1">
                            <span>Anchored</span>
                            <span className="text-blue-400">true</span>
                        </div>
                         <div className="grid grid-cols-2 border-b border-[#444] pb-1">
                            <span>CanCollide</span>
                            <span className="text-blue-400">true</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Studio;
