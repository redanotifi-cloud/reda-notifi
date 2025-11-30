
import React, { useEffect, useRef, useState } from 'react';
import { User, ShopItem } from '../types';
import { User as UserIcon, Users, MapPin, Calendar, ShoppingBag, Check, ShieldCheck, PlusCircle, DollarSign, Tag } from 'lucide-react';
import * as THREE from 'three';

interface ProfileProps {
  user: User;
  shopItems: ShopItem[];
  onBuyItem: (itemId: string, price: number) => boolean;
  onCreateItem: (item: ShopItem) => void;
  onUpdatePrice: (itemId: string, newPrice: number) => void;
}

// Visual data for accessories (shared logic with Avatar.tsx)
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

const Profile: React.FC<ProfileProps> = ({ user, shopItems, onBuyItem, onCreateItem, onUpdatePrice }) => {
  const mountRef = useRef<HTMLDivElement>(null); // For Item Preview
  const avatarRef = useRef<HTMLDivElement>(null); // For User Avatar Preview
  const [activeTab, setActiveTab] = useState<'shop' | 'create'>('shop');
  
  // Creation Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('100');
  const [newItemType, setNewItemType] = useState<ShopItem['type']>('Hat');
  const [newItemColor, setNewItemColor] = useState('#ffffff');

  // --- 1. USER 3D AVATAR RENDERER (IN HEADER) ---
  useEffect(() => {
    if (!avatarRef.current) return;

    // Cleanup
    while(avatarRef.current.firstChild) {
        avatarRef.current.removeChild(avatarRef.current.firstChild);
    }

    const width = avatarRef.current.clientWidth;
    const height = avatarRef.current.clientHeight;
    
    const scene = new THREE.Scene();
    // Transparent background for avatar to blend with banner
    // But since banner has gradient, maybe transparent is best, or null
    
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 6.5); // Zoomed in on upper body
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    avatarRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 10);
    scene.add(dirLight);

    // --- BUILD CHARACTER ---
    const playerGroup = new THREE.Group();
    
    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: user.avatarColors.skin });
    const shirtMat = new THREE.MeshStandardMaterial({ color: user.avatarColors.shirt });
    const pantsMat = new THREE.MeshStandardMaterial({ color: user.avatarColors.pants });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), shirtMat);
    torso.position.y = 2;
    playerGroup.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.8, 32), skinMat);
    head.position.y = 3.4;
    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat); leftEye.position.set(-0.2, 0.1, 0.55);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat); rightEye.position.set(0.2, 0.1, 0.55);
    head.add(leftEye); head.add(rightEye);
    playerGroup.add(head);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.8, 2, 0.8);
    const leftArm = new THREE.Mesh(armGeo, skinMat); leftArm.position.set(-1.5, 2, 0);
    const rightArm = new THREE.Mesh(armGeo, skinMat); rightArm.position.set(1.5, 2, 0);
    // Pose Arms
    leftArm.rotation.z = 0.2; rightArm.rotation.z = -0.2;
    playerGroup.add(leftArm); playerGroup.add(rightArm);

    // Legs (Only tops visible in portrait usually, but build anyway)
    const legGeo = new THREE.BoxGeometry(0.9, 2, 1);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat); leftLeg.position.set(-0.5, 0, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsMat); rightLeg.position.set(0.5, 0, 0);
    playerGroup.add(leftLeg); playerGroup.add(rightLeg);

    // --- EQUIP ITEMS ---
    user.equippedItems.forEach(itemId => {
        const data = ACCESSORY_DATA[itemId];
        if (!data) return;

        const accMat = new THREE.MeshStandardMaterial({ color: data.color, metalness: 0.4, roughness: 0.3 });

        if (data.type === 'Hat') {
            if (itemId.includes('crown')) {
                const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.3, 16), accMat);
                crown.position.y = 0.5; head.add(crown);
            } else if (itemId.includes('valkyrie') || itemId.includes('dominus')) {
                const helm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), accMat);
                helm.position.y = 0.1; head.add(helm);
            } else { // Fedora
                 const brim = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.1, 16), accMat);
                 const top = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.6, 16), accMat);
                 top.position.y = 0.3; brim.position.y = 0;
                 const hat = new THREE.Group(); hat.add(brim); hat.add(top);
                 hat.position.y = 0.5; head.add(hat);
            }
        } else if (data.type === 'Back') { // Wings
            const wingGeo = new THREE.BoxGeometry(1.5, 3, 0.2);
            const w1 = new THREE.Mesh(wingGeo, accMat); w1.position.set(-1, 0.5, 0.6); w1.rotation.z = 0.5; w1.rotation.y = -0.5;
            const w2 = new THREE.Mesh(wingGeo, accMat); w2.position.set(1, 0.5, 0.6); w2.rotation.z = -0.5; w2.rotation.y = 0.5;
            torso.add(w1); torso.add(w2);
        } else if (data.type === 'Face') { // Glasses
            const glasses = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.2), accMat);
            glasses.position.set(0, 0.1, 0.5); head.add(glasses);
        } else if (data.type === 'Side') { // Sword
            const sword = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 0.5), accMat);
            sword.position.set(0.8, 0, 0.6); sword.rotation.z = -0.5; torso.add(sword);
        }
    });

    scene.add(playerGroup);

    // Animation
    let frameId: number;
    const animate = () => {
        frameId = requestAnimationFrame(animate);
        // Gentle idle rotation
        playerGroup.rotation.y = Math.sin(Date.now() * 0.001) * 0.2;
        renderer.render(scene, camera);
    };
    animate();

    return () => {
        cancelAnimationFrame(frameId);
        if (avatarRef.current) avatarRef.current.removeChild(renderer.domElement);
        renderer.dispose();
    };

  }, [user]);


  // --- 2. ITEM PREVIEW RENDERER (EXISTING) ---
  useEffect(() => {
    if (!mountRef.current) return;
    while(mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xffd700, 2);
    spotLight.position.set(5, 10, 5);
    spotLight.angle = Math.PI / 4;
    scene.add(spotLight);
    const blueLight = new THREE.PointLight(0x3b82f6, 1);
    blueLight.position.set(-5, 2, -5);
    scene.add(blueLight);

    const crownGroup = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32), goldMat);
    crownGroup.add(base);

    const spikeCount = 6;
    for(let i=0; i<spikeCount; i++) {
        const angle = (i / spikeCount) * Math.PI * 2;
        const x = Math.cos(angle) * 1.5; const z = Math.sin(angle) * 1.5;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1, 16), goldMat);
        spike.position.set(x, 0.6, z); spike.rotation.x = -0.2; spike.lookAt(x * 2, 2, z * 2);
        crownGroup.add(spike);
        const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xff0000 : 0x0000ff, emissive: i % 2 === 0 ? 0x550000 : 0x000055, metalness: 0.5, roughness: 0.1 }));
        gem.position.set(x * 1.1, 1.1, z * 1.1); crownGroup.add(gem);
    }
    scene.add(crownGroup);

    let frameId: number;
    const animate = () => {
        frameId = requestAnimationFrame(animate);
        crownGroup.rotation.y += 0.01;
        crownGroup.position.y = Math.sin(Date.now() * 0.002) * 0.1; 
        renderer.render(scene, camera);
    };
    animate();

    return () => {
        cancelAnimationFrame(frameId);
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
        renderer.dispose();
    };

  }, []);

  const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newItem: ShopItem = {
          id: `item_${Date.now()}`,
          name: newItemName || 'New Item',
          price: parseInt(newItemPrice) || 0,
          type: newItemType,
          color: newItemColor,
          icon: newItemType === 'Hat' ? '🎩' : newItemType === 'Face' ? '😎' : '⚔️',
          creator: user.username
      };
      onCreateItem(newItem);
      alert('Item Created Successfully!');
      setNewItemName('');
      setActiveTab('shop');
  };

  const featuredItem = shopItems[0]; 
  const isFeaturedOwned = user.inventory.includes(featuredItem?.id);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header / Banner */}
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl mb-8">
        <div className="h-40 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 relative">
             <div className="absolute top-4 right-4 flex gap-2 z-10">
                 <button className="bg-black/30 hover:bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur-sm border border-white/10 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-400" /> Admin Mode
                 </button>
             </div>
        </div>
        <div className="px-8 pb-8 relative flex flex-col md:flex-row items-end gap-6 -mt-16">
            
            {/* 3D Avatar Container */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-800 border-4 border-gray-700 overflow-hidden relative shadow-2xl shrink-0 z-10">
                 {/* This div will hold the Three.js avatar */}
                 <div ref={avatarRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-gradient-to-b from-gray-700 to-gray-900" title="Your 3D Avatar"></div>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row justify-between items-end md:items-center gap-4 w-full pt-16 md:pt-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                        {user.username}
                        {user.username === 'Owner_Admin' && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">OWNER</span>}
                    </h1>
                    <p className="text-gray-400 italic text-sm">"Unlimited Power! Building the future of BloxClone."</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 999k Friends</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 50M Followers</span>
                    </div>
                </div>
                
                <div className="flex gap-6 text-center">
                    <div>
                        <div className="text-xl font-bold text-white">9,999+</div>
                        <div className="text-xs text-gray-500 uppercase">Place Visits</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white">2025</div>
                        <div className="text-xs text-gray-500 uppercase">Join Date</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column */}
          <div className="w-full md:w-1/3 space-y-6">
             <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-bold text-white mb-4">About</h3>
                <div className="space-y-4">
                    <p className="text-gray-400 text-sm leading-relaxed">
                        The creator of BloxClone. I have infinite Robux and I am here to test the economy.
                    </p>
                    <hr className="border-gray-700" />
                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <MapPin className="w-4 h-4" /> Admin HQ
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar className="w-4 h-4" /> Joined Feb 2025
                        </div>
                    </div>
                </div>
             </div>
             
             {/* Owned Inventory Mini-view */}
             <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                 <h3 className="font-bold text-white mb-4">My Inventory ({user.inventory.length})</h3>
                 <div className="grid grid-cols-4 gap-2">
                     {user.inventory.map((itemId) => {
                         const item = shopItems.find(i => i.id === itemId);
                         if (!item) return null;
                         return (
                            <div key={itemId} className="aspect-square bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center text-2xl border border-gray-600" title={item.name}>
                                {item.icon}
                            </div>
                         )
                     })}
                     {/* Placeholders */}
                     {Array.from({length: Math.max(0, 8 - user.inventory.length)}).map((_, i) => (
                         <div key={`ph-${i}`} className="aspect-square bg-gray-700/30 rounded-lg" />
                     ))}
                 </div>
             </div>
          </div>

          {/* Shop / Inventory Column */}
          <div className="w-full md:w-2/3">
             <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setActiveTab('shop')} className={`text-lg font-bold flex items-center gap-2 transition-colors ${activeTab === 'shop' ? 'text-white' : 'text-gray-500'}`}>
                            <ShoppingBag className="w-5 h-5" /> Shop
                        </button>
                        <div className="w-px h-6 bg-gray-700"></div>
                        <button onClick={() => setActiveTab('create')} className={`text-lg font-bold flex items-center gap-2 transition-colors ${activeTab === 'create' ? 'text-white' : 'text-gray-500'}`}>
                            <PlusCircle className="w-5 h-5" /> Create
                        </button>
                    </div>
                    <span className="text-xs text-green-400 font-mono border border-green-900 bg-green-900/20 px-2 py-1 rounded">
                        Balance: R$ {user.robux.toLocaleString()}
                    </span>
                </div>

                <div className="p-6">
                    {activeTab === 'shop' ? (
                        <>
                            {/* Featured Item: 3D Crown */}
                            {featuredItem && (
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col md:flex-row gap-6 hover:border-yellow-500/50 transition-colors shadow-lg mb-8">
                                    <div className="w-full md:w-1/2 aspect-square md:aspect-video bg-black/40 rounded-lg overflow-hidden relative border border-gray-700">
                                        <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded z-10 animate-pulse">LEGENDARY</div>
                                        {/* 3D Canvas Mount */}
                                        <div ref={mountRef} className="w-full h-full cursor-move" title="Interactive 3D Preview" />
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="text-2xl font-extrabold text-white mb-1">{featuredItem.name}</h3>
                                        <p className="text-gray-400 text-sm mb-4">
                                            The ultimate symbol of status. Only for the owners of the platform.
                                        </p>
                                        
                                        <div className="mt-auto">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-4 h-4 border-2 border-green-500 rotate-45 rounded-[1px]"></div>
                                                <span className="text-2xl font-bold text-white">{featuredItem.price.toLocaleString()}</span>
                                                {user.username === 'Owner_Admin' && (
                                                    <input 
                                                        type="number" 
                                                        className="bg-gray-800 text-white w-24 text-xs p-1 rounded border border-red-500" 
                                                        defaultValue={featuredItem.price}
                                                        onBlur={(e) => onUpdatePrice(featuredItem.id, parseInt(e.target.value))}
                                                    />
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => onBuyItem(featuredItem.id, featuredItem.price)}
                                                disabled={isFeaturedOwned}
                                                className={`w-full font-bold py-3 rounded-lg shadow-lg active:translate-y-1 transition-all flex items-center justify-center gap-2
                                                ${isFeaturedOwned 
                                                    ? 'bg-gray-600 text-gray-300 cursor-default shadow-none translate-y-1' 
                                                    : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                            >
                                                {isFeaturedOwned ? (
                                                    <> <Check className="w-5 h-5" /> Item Owned </>
                                                ) : (
                                                    'Buy Now'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Other Items Grid */}
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">More Items</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {shopItems.slice(1).map((item) => {
                                    const isOwned = user.inventory.includes(item.id);
                                    return (
                                        <div key={item.id} className="bg-gray-900 rounded-lg p-3 border border-gray-700 hover:-translate-y-1 transition-transform group relative">
                                            <div className="aspect-square bg-gray-800 rounded-md mb-2 flex items-center justify-center relative overflow-hidden">
                                                <span className="text-5xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                                                {isOwned && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <Check className="w-8 h-8 text-green-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                                            <div className="text-[10px] text-gray-500 mb-2">By {item.creator || 'Roblox'}</div>
                                            
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-1">
                                                    {item.price > 0 ? (
                                                        <>
                                                        <div className="w-3 h-3 border border-green-500 rotate-45"></div>
                                                        <span className="text-xs font-bold text-gray-300">{item.price.toLocaleString()}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs font-bold text-green-400">FREE</span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => onBuyItem(item.id, item.price)}
                                                    disabled={isOwned}
                                                    className={`text-xs px-2 py-1 rounded font-bold transition-colors ${isOwned ? 'bg-gray-700 text-gray-400' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                                                >
                                                    {isOwned ? 'Owned' : 'Buy'}
                                                </button>
                                            </div>
                                            
                                            {/* ADMIN CONTROLS */}
                                            {user.username === 'Owner_Admin' && (
                                                <div className="mt-2 pt-2 border-t border-gray-800">
                                                    <label className="text-[10px] text-red-400 block mb-1">Set Price:</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-black border border-red-900 rounded text-xs p-1"
                                                        defaultValue={item.price}
                                                        onBlur={(e) => onUpdatePrice(item.id, parseInt(e.target.value))}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        // CREATE TAB
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Create Your Own Item</h2>
                            <p className="text-gray-400 text-sm">Design custom accessories and sell them to the community. You can set the price cheap or expensive.</p>
                            
                            <form onSubmit={handleCreateSubmit} className="bg-gray-900 p-6 rounded-xl border border-gray-700 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Item Name</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                        <input 
                                            type="text" 
                                            required
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 px-4 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="e.g. Red Ninja Mask"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Price (Robux)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-green-500" />
                                            <input 
                                                type="number" 
                                                required
                                                min="0"
                                                value={newItemPrice}
                                                onChange={(e) => setNewItemPrice(e.target.value)}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 px-4 text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Type</label>
                                        <select 
                                            value={newItemType}
                                            onChange={(e) => setNewItemType(e.target.value as any)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="Hat">Hat</option>
                                            <option value="Face">Face</option>
                                            <option value="Gear">Gear</option>
                                            <option value="Accessory">Accessory</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Primary Color</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="color" 
                                            value={newItemColor}
                                            onChange={(e) => setNewItemColor(e.target.value)}
                                            className="w-12 h-12 rounded cursor-pointer bg-transparent"
                                        />
                                        <span className="text-gray-400 text-sm">{newItemColor}</span>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg mt-4 flex items-center justify-center gap-2">
                                    <PlusCircle className="w-5 h-5" /> Publish to Shop
                                </button>
                            </form>
                        </div>
                    )}
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;
