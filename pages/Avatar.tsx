
import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Shirt, User as UserIcon, Box, Check } from 'lucide-react';
import * as THREE from 'three';
import { User, ShopItem } from '../types';

interface AvatarProps {
  user: User;
  onEquip: (itemId: string) => void;
  onUpdateColors: (type: 'skin' | 'shirt' | 'pants', color: string) => void;
}

// Mock items data (needed here to know visual properties)
const ACCESSORY_DATA: Record<string, { type: 'Hat' | 'Back' | 'Side' | 'Face', color: number }> = {
    'crown_gold': { type: 'Hat', color: 0xffd700 },
    'valkyrie_helm': { type: 'Hat', color: 0x8b5cf6 },
    'dominus_dark': { type: 'Hat', color: 0x111111 },
    'fedora_sparkle': { type: 'Hat', color: 0x3b82f6 },
    'wings_angel': { type: 'Back', color: 0xffffff },
    'sword_void': { type: 'Side', color: 0x9333ea },
    'glasses_deal': { type: 'Face', color: 0x000000 },
    'face_happy': { type: 'Face', color: 0xffff00 },
};

const Avatar: React.FC<AvatarProps> = ({ user, onEquip, onUpdateColors }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const [tab, setTab] = useState<'body' | 'inventory'>('body');

  // Initialize Three.js Scene for Avatar Preview
  useEffect(() => {
    if (!mountRef.current) return;

    // Cleanup previous renderer
    while(mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1f2937); // Dark gray background matching UI
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3, 12);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Initial Player Group
    const playerGroup = new THREE.Group();
    playerRef.current = playerGroup;
    scene.add(playerGroup);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (playerRef.current) {
          playerRef.current.rotation.y += 0.005; // Slow rotation
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Player Mesh when colors OR Equipped items change
  useEffect(() => {
    if (!playerRef.current) return;

    // Clear old mesh
    while(playerRef.current.children.length > 0){ 
        playerRef.current.remove(playerRef.current.children[0]); 
    }

    // --- REBUILD PLAYER BODY ---
    const shirtColor = user.avatarColors.shirt;
    const pantsColor = user.avatarColors.pants;
    const skinColor = user.avatarColors.skin;

    // Torso
    const torsoGeo = new THREE.BoxGeometry(2, 2, 1);
    const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 2;
    torso.castShadow = true;
    playerRef.current.add(torso);

    // Head
    const headGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: skinColor });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 3.4;
    head.castShadow = true;
    
    // Default Face (simple boxes for eyes)
    const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 0.1, 0.55); // Relative to head center
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.2, 0.1, 0.55);
    
    head.add(leftEye);
    head.add(rightEye);
    playerRef.current.add(head);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.9, 2, 1);
    const legMat = new THREE.MeshStandardMaterial({ color: pantsColor });
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.5, 0, 0);
    leftLeg.castShadow = true;
    playerRef.current.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.5, 0, 0);
    rightLeg.castShadow = true;
    playerRef.current.add(rightLeg);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.8, 2, 0.8);
    const armMat = new THREE.MeshStandardMaterial({ color: skinColor });
    
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-1.5, 2, 0);
    leftArm.castShadow = true;
    playerRef.current.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(1.5, 2, 0);
    rightArm.castShadow = true;
    playerRef.current.add(rightArm);


    // --- ATTACH ACCESSORIES ---
    user.equippedItems.forEach(itemId => {
        const data = ACCESSORY_DATA[itemId];
        if (!data) return; // Unknown item

        const mat = new THREE.MeshStandardMaterial({ 
            color: data.color, 
            metalness: 0.5, 
            roughness: 0.2,
            emissive: data.color === 0x000000 ? 0x000000 : 0x222222
        });

        if (data.type === 'Hat') {
            if (itemId.includes('crown')) {
                // Crown logic
                const crownGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.3, 16);
                const crown = new THREE.Mesh(crownGeo, mat);
                crown.position.y = 0.5; // Top of head
                head.add(crown);
            } else if (itemId.includes('valkyrie') || itemId.includes('dominus')) {
                // Helm Logic
                const helmGeo = new THREE.BoxGeometry(1.4, 1.2, 1.4);
                const helm = new THREE.Mesh(helmGeo, mat);
                helm.position.y = 0.1;
                head.add(helm);
            } else {
                 // Fedora
                const brimGeo = new THREE.CylinderGeometry(1, 1, 0.1, 16);
                const topGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.6, 16);
                const hat = new THREE.Group();
                const brim = new THREE.Mesh(brimGeo, mat);
                const top = new THREE.Mesh(topGeo, mat);
                top.position.y = 0.3;
                hat.add(brim);
                hat.add(top);
                hat.position.y = 0.5;
                head.add(hat);
            }
        } 
        else if (data.type === 'Back') {
            // Wings
            const wingGeo = new THREE.BoxGeometry(1.5, 3, 0.2);
            const leftWing = new THREE.Mesh(wingGeo, mat);
            leftWing.position.set(-1, 0.5, 0.6);
            leftWing.rotation.z = 0.5;
            leftWing.rotation.y = -0.5;
            
            const rightWing = new THREE.Mesh(wingGeo, mat);
            rightWing.position.set(1, 0.5, 0.6);
            rightWing.rotation.z = -0.5;
            rightWing.rotation.y = 0.5;

            torso.add(leftWing);
            torso.add(rightWing);
        }
        else if (data.type === 'Side') {
            // Sword
            const bladeGeo = new THREE.BoxGeometry(0.2, 4, 0.5);
            const sword = new THREE.Mesh(bladeGeo, mat);
            sword.position.set(0.8, 0, 0.6);
            sword.rotation.z = -0.5;
            torso.add(sword);
        }
        else if (data.type === 'Face') {
            // Glasses
            const glassGeo = new THREE.BoxGeometry(1.2, 0.3, 0.2);
            const glasses = new THREE.Mesh(glassGeo, mat);
            glasses.position.set(0, 0.1, 0.5);
            head.add(glasses);
        }
    });

  }, [user.avatarColors, user.equippedItems]);

  const colors = [
    '#eab308', '#ef4444', '#3b82f6', '#16a34a', '#a855f7', '#ec4899', '#64748b', '#1f2937', '#ffffff', '#000000'
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="text-3xl font-extrabold text-white mb-4">Avatar Editor</h1>
      
      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Left: 3D Preview */}
        <div className="flex-1 flex flex-col relative bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
           <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded text-xs text-white font-mono">
              3D PREVIEW
           </div>
           <div ref={mountRef} className="w-full h-full min-h-[400px]" />
           
           <div className="absolute bottom-4 left-0 right-0 flex justify-center pb-4">
              <button 
                onClick={() => {
                    onUpdateColors('skin', '#eab308');
                    onUpdateColors('shirt', '#3b82f6');
                    onUpdateColors('pants', '#16a34a');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 hover:bg-gray-700 text-white rounded-full border border-gray-600 transition-colors backdrop-blur-sm"
              >
                <RefreshCw className="w-4 h-4" /> Reset Avatar
              </button>
           </div>
        </div>

        {/* Right: Controls */}
        <div className="flex-1 lg:max-w-md flex flex-col">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 bg-gray-800 p-1 rounded-lg">
                <button 
                    onClick={() => setTab('body')}
                    className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${tab === 'body' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    Body & Color
                </button>
                <button 
                    onClick={() => setTab('inventory')}
                    className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${tab === 'inventory' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    Accessories ({user.inventory.length})
                </button>
            </div>

            {tab === 'body' ? (
                <div className="overflow-y-auto pr-2 space-y-6">
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-yellow-400" /> Skin Tone
                        </h2>
                        <div className="flex flex-wrap gap-3">
                        {colors.map(c => (
                            <button 
                            key={`skin-${c}`}
                            onClick={() => onUpdateColors('skin', c)}
                            className={`w-12 h-12 rounded-lg border-4 shadow-sm ${user.avatarColors.skin === c ? 'border-white scale-110' : 'border-gray-700 hover:border-gray-500'} transition-all`}
                            style={{ backgroundColor: c }}
                            />
                        ))}
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Shirt className="w-5 h-5 text-blue-400" /> Shirt Color
                        </h2>
                        <div className="flex flex-wrap gap-3">
                        {colors.map(c => (
                            <button 
                            key={`shirt-${c}`}
                            onClick={() => onUpdateColors('shirt', c)}
                            className={`w-12 h-12 rounded-lg border-4 shadow-sm ${user.avatarColors.shirt === c ? 'border-white scale-110' : 'border-gray-700 hover:border-gray-500'} transition-all`}
                            style={{ backgroundColor: c }}
                            />
                        ))}
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-lg">👖</span> Pants Color
                        </h2>
                        <div className="flex flex-wrap gap-3">
                        {colors.map(c => (
                            <button 
                            key={`pants-${c}`}
                            onClick={() => onUpdateColors('pants', c)}
                            className={`w-12 h-12 rounded-lg border-4 shadow-sm ${user.avatarColors.pants === c ? 'border-white scale-110' : 'border-gray-700 hover:border-gray-500'} transition-all`}
                            style={{ backgroundColor: c }}
                            />
                        ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg h-full overflow-y-auto">
                    {user.inventory.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>You have no items.</p>
                            <p className="text-xs mt-2">Go to Profile to buy some!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {user.inventory.map(itemId => {
                                const isEquipped = user.equippedItems.includes(itemId);
                                return (
                                    <button 
                                        key={itemId}
                                        onClick={() => onEquip(itemId)}
                                        className={`aspect-square rounded-lg border-2 relative flex flex-col items-center justify-center bg-gray-900 transition-all ${isEquipped ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-600 hover:border-gray-400'}`}
                                    >
                                        <span className="text-3xl mb-1">
                                            {ACCESSORY_DATA[itemId] ? (
                                                itemId.includes('crown') ? '👑' : 
                                                itemId.includes('sword') ? '⚔️' :
                                                itemId.includes('wings') ? '👼' : '🎩'
                                            ) : '📦'}
                                        </span>
                                        {isEquipped && (
                                            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                                                <Check className="w-3 h-3 text-black" />
                                            </div>
                                        )}
                                        <span className="text-[10px] text-gray-400 truncate w-full px-1 text-center">
                                            {itemId.split('_')[1]}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Avatar;
