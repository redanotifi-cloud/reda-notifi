
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, ThumbsUp, ThumbsDown, Star, Share2, MoreHorizontal, X, Settings, MessageSquare, Send, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle } from 'lucide-react';
import { Game, User } from '../types';
import * as THREE from 'three';

interface GameDetailProps {
  games: Game[];
  user?: User;
}

interface InGameMessage {
    id: string;
    sender: string;
    text: string;
    color: string;
    isSystem?: boolean;
}

const BAD_WORDS = ['stupid', 'idiot', 'bad', 'ugly', 'hate', 'noob', 'dumb'];

const GameDetail: React.FC<GameDetailProps> = ({ games, user }) => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<InGameMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatFocused, setIsChatFocused] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Game Container Ref
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const botsRef = useRef<Map<string, { mesh: THREE.Group, target: THREE.Vector3, name: string }>>(new Map());
  
  // Input State
  const keysPressed = useRef<Set<string>>(new Set());
  // External triggers for chat bubbles
  const bubbleTriggerRef = useRef<(name: string, text: string) => void>(() => {});

  useEffect(() => {
    const found = games.find(g => g.id === id);
    setGame(found);
  }, [id, games]);

  const handlePlay = () => {
    setIsPlaying(true);
    setLoadingProgress(0);
    // Simulate loading
    const interval = setInterval(() => {
        setLoadingProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + Math.random() * 20;
        });
    }, 200);

    // Init Chat
    setChatMessages([
        { id: 'sys1', sender: 'System', text: 'Welcome to the server!', color: '#fbbf24' },
        { id: 'sys2', sender: 'System', text: 'Press / to chat.', color: '#fbbf24' }
    ]);
  };

  const stopGame = () => {
      setIsPlaying(false);
  };

  // --- CHAT LOGIC WITH PROFANITY FILTER ---
  const handleSendChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const username = user?.username || 'Guest';
    
    // Profanity Check
    const isProfane = BAD_WORDS.some(word => chatInput.toLowerCase().includes(word));
    
    if (isProfane) {
        // Warning System Message
        const warningMsg: InGameMessage = {
            id: Date.now().toString(),
            sender: '[SYSTEM]',
            text: 'Warning! Profanity is allowed. Please be respectful.',
            color: '#ef4444', // Red
            isSystem: true
        };
        setChatMessages(prev => [...prev, warningMsg]);
        setChatInput("");
        return;
    }

    const newMsg: InGameMessage = {
        id: Date.now().toString(),
        sender: username,
        text: chatInput,
        color: '#ffffff'
    };

    setChatMessages(prev => [...prev, newMsg]);
    
    // Trigger Visual Bubble
    bubbleTriggerRef.current(username, chatInput);

    setChatInput("");
  };

  useEffect(() => {
     if (chatEndRef.current) {
         chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
     }
  }, [chatMessages]);

  // Simulate Bot Chatter & Activity
  useEffect(() => {
      if (!isPlaying || loadingProgress < 100) return;
      
      const botConfig = [
          { name: 'Noob123', color: '#60a5fa' },
          { name: 'CoolCat_99', color: '#f472b6' },
          { name: 'BuilderMan', color: '#4ade80' },
          { name: 'Speedy_X', color: '#fb923c' }
      ];
      
      const phrases = [
          "Anyone want to trade?",
          "How do I jump high?",
          "This map is insane!",
          "Lag...",
          "plz donate",
          "Follow me for secret!",
          "lol",
          "gg",
          "where is the secret item?",
          "nice avatar",
          "skibidi?"
      ];

      const interval = setInterval(() => {
          if (Math.random() > 0.6) return; // Random chance to skip
          const bot = botConfig[Math.floor(Math.random() * botConfig.length)];
          const text = phrases[Math.floor(Math.random() * phrases.length)];
          
          setChatMessages(prev => {
              const newMsgs = [...prev, {
                  id: Date.now().toString() + Math.random(),
                  sender: bot.name,
                  text: text,
                  color: bot.color
              }];
              return newMsgs.slice(-50); 
          });

          // Trigger visual bubble for bot
          bubbleTriggerRef.current(bot.name, text);

      }, 3500);

      return () => clearInterval(interval);
  }, [isPlaying, loadingProgress]);


  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Chat Toggle
        if (e.key === '/' || e.key === 'Enter') {
            if (!isChatFocused) {
                e.preventDefault();
                setIsChatFocused(true);
                setTimeout(() => chatInputRef.current?.focus(), 10);
                return;
            }
        }

        if (isChatFocused) {
            if (e.key === 'Escape') {
                setIsChatFocused(false);
                chatInputRef.current?.blur();
            }
            return; // STOP GAME INPUTS WHEN CHATTING
        }

        // Prevent space from scrolling
        if (e.code === 'Space') e.preventDefault();
        keysPressed.current.add(e.code);
        keysPressed.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (isChatFocused) return;
        keysPressed.current.delete(e.code);
        keysPressed.current.delete(e.key.toLowerCase());
    };

    if (isPlaying && loadingProgress === 100) {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, loadingProgress, isChatFocused]);

  // Touch Control Handlers
  const handleTouchStart = (key: string) => {
      keysPressed.current.add(key);
  };
  const handleTouchEnd = (key: string) => {
      keysPressed.current.delete(key);
  };


  // Three.js Game Loop
  useEffect(() => {
    if (!isPlaying || loadingProgress < 100 || !mountRef.current || !game) return;

    // --- SETUP ---
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky Blue
    scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 80, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    // Optimize shadow frustum
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    scene.add(dirLight);

    // --- WORLD GENERATION ---
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);
    const collidables: THREE.Box3[] = [];
    
    // Helper to create parts
    const createPart = (x: number, y: number, z: number, w: number, h: number, d: number, color: number | string, texture?: THREE.Texture) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const matParams: THREE.MeshStandardMaterialParameters = { roughness: 0.3, metalness: 0.1 };
        if (texture) { matParams.map = texture; matParams.color = 0xffffff; } 
        else { matParams.color = new THREE.Color(color); }

        const mat = new THREE.MeshStandardMaterial(matParams);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y + h/2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        worldGroup.add(mesh);
        collidables.push(new THREE.Box3().setFromObject(mesh));
        return mesh;
    };

    const createTree = (x: number, z: number) => {
        createPart(x, 0, z, 1.5, 4, 1.5, 0x5D4037);
        createPart(x, 4, z, 4, 4, 4, 0x2E7D32);
        createPart(x, 6, z, 3, 3, 3, 0x4CAF50);
    };

    // --- MAP LOGIC (Simplified from previous) ---
    const genre = game.genre?.toLowerCase() || '';
    if (genre.includes('brainrot') || game.title.includes('Brainrot')) {
        scene.background = new THREE.Color(0x2e1065);
        createPart(0, 0, 0, 150, 1, 150, 0x4c1d95); 
        createPart(0, 0, -20, 10, 5, 10, 0xff00ff);
        createPart(-20, 0, 20, 5, 10, 5, 0xffff00);
    } else if (genre.includes('obby')) {
        createPart(0, 0, 0, 15, 1, 15, 0x4ade80); 
        for(let i=0; i<6; i++) createPart(0, 1 + i, -12 - (i * 4), 6, 1, 3, 0xff4444);
        createPart(0, 10, -50, 20, 1, 20, 0xffffff);
    } else {
        createPart(0, 0, 0, 100, 1, 100, 0x4ade80);
        createTree(15, -15);
        createTree(-20, 10);
        createPart(0, 1, -15, 4, 4, 4, 0x8B4513);
    }

    // --- CHARACTER FACTORY ---
    const createCharacter = (color: string | number, name: string) => {
        const group = new THREE.Group();
        
        // Materials
        const bodyMat = new THREE.MeshStandardMaterial({ color: color });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xeab308 }); // Yellow skin
        
        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), bodyMat);
        torso.position.y = 3;
        torso.castShadow = true;
        group.add(torso);

        // Head
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.8, 32), skinMat);
        head.position.y = 4.4;
        head.castShadow = true;
        group.add(head);

        // Name Tag
        const canvas = document.createElement('canvas');
        canvas.width = 256; 
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, 256, 64);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(name, 128, 32);
        }
        const nameTex = new THREE.CanvasTexture(canvas);
        const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nameTex }));
        nameSprite.position.set(0, 6.5, 0);
        nameSprite.scale.set(4, 1, 1);
        group.add(nameSprite);

        // Limbs
        const limbGeo = new THREE.BoxGeometry(1, 2, 1);
        const limbMat = new THREE.MeshStandardMaterial({ color: 0x16a34a }); // Green Pants
        const armMat = skinMat;

        const leftLeg = new THREE.Mesh(limbGeo, limbMat);
        leftLeg.position.set(-0.5, 1, 0);
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(limbGeo, limbMat);
        rightLeg.position.set(0.5, 1, 0);
        group.add(rightLeg);

        const leftArm = new THREE.Mesh(limbGeo, armMat);
        leftArm.position.set(-1.5, 3, 0);
        group.add(leftArm);

        const rightArm = new THREE.Mesh(limbGeo, armMat);
        rightArm.position.set(1.5, 3, 0);
        group.add(rightArm);

        // Store references for animation
        group.userData = { leftLeg, rightLeg, leftArm, rightArm };

        return group;
    };

    // --- CREATE PLAYER ---
    const myPlayer = createCharacter(0x3b82f6, user?.username || 'Guest');
    myPlayer.position.set(0, 5, 0);
    scene.add(myPlayer);
    playerRef.current = myPlayer;

    // --- CREATE BOTS ---
    const botNames = ['Noob123', 'CoolCat_99', 'BuilderMan', 'Speedy_X'];
    const botColors = [0xff0000, 0xff00ff, 0x00ffff, 0xffa500];
    
    botNames.forEach((name, i) => {
        const botMesh = createCharacter(botColors[i], name);
        // Random start pos
        const bx = (Math.random() - 0.5) * 40;
        const bz = (Math.random() - 0.5) * 40;
        botMesh.position.set(bx, 10, bz);
        scene.add(botMesh);
        
        botsRef.current.set(name, {
            mesh: botMesh,
            target: new THREE.Vector3(bx, 0, bz),
            name: name
        });
    });

    // --- CHAT BUBBLE SYSTEM ---
    const createBubble = (parent: THREE.Group, text: string) => {
        // Create Canvas Texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128; // Rectangular
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Bubble shape
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 5;
        
        // Round rect
        const x=10, y=10, w=492, h=108, r=20;
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.arcTo(x+w, y, x+w, y+h, r);
        ctx.arcTo(x+w, y+h, x, y+h, r);
        ctx.arcTo(x, y+h, x, y, r);
        ctx.arcTo(x, y, x+w, y, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text.substring(0, 30), 256, 64); // Limit char count for display

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.position.set(0, 8, 0); // High above head
        sprite.scale.set(8, 2, 1);
        
        parent.add(sprite);
        
        // Remove after 4 seconds
        setTimeout(() => {
            parent.remove(sprite);
            mat.dispose();
            tex.dispose();
        }, 4000);
    };

    // Assign trigger
    bubbleTriggerRef.current = (name, text) => {
        if (name === (user?.username || 'Guest') && playerRef.current) {
            createBubble(playerRef.current, text);
        } else if (botsRef.current.has(name)) {
            const bot = botsRef.current.get(name);
            if (bot) createBubble(bot.mesh, text);
        }
    };


    // --- PHYSICS CONSTANTS ---
    const MOVE_SPEED = 0.8;
    const JUMP_FORCE = 1.4;
    const GRAVITY = 0.07;
    
    // Player State
    const velocity = new THREE.Vector3(0, 0, 0);
    const position = new THREE.Vector3(0, 10, 0);
    let isGrounded = false;
    let animTime = 0;
    
    // Check Collision
    const checkCollision = (newPos: THREE.Vector3) => {
        const PLAYER_WIDTH = 1.5; const PLAYER_HEIGHT = 5; const PLAYER_DEPTH = 1.5;
        const min = new THREE.Vector3(newPos.x - PLAYER_WIDTH/2, newPos.y, newPos.z - PLAYER_DEPTH/2);
        const max = new THREE.Vector3(newPos.x + PLAYER_WIDTH/2, newPos.y + PLAYER_HEIGHT, newPos.z + PLAYER_DEPTH/2);
        const pBox = new THREE.Box3(min, max);
        for (const box of collidables) {
            if (pBox.intersectsBox(box)) return box;
        }
        return null;
    };


    // --- ANIMATION LOOP ---
    const animate = () => {
        requestAnimationFrame(animate);

        // --- BOT AI UPDATE ---
        botsRef.current.forEach((bot) => {
            // Pick new target if close
            if (bot.mesh.position.distanceTo(bot.target) < 1) {
                if (Math.random() < 0.02) { // Small chance to move each frame
                    bot.target.x = (Math.random() - 0.5) * 60;
                    bot.target.z = (Math.random() - 0.5) * 60;
                }
            } else {
                // Move towards target
                const dir = new THREE.Vector3().subVectors(bot.target, bot.mesh.position).normalize();
                bot.mesh.position.add(dir.multiplyScalar(0.2));
                bot.mesh.lookAt(bot.target.x, bot.mesh.position.y, bot.target.z);
                
                // Animate legs
                const bTime = Date.now() * 0.01;
                bot.mesh.userData.leftLeg.rotation.x = Math.sin(bTime) * 0.5;
                bot.mesh.userData.rightLeg.rotation.x = Math.sin(bTime + Math.PI) * 0.5;
                bot.mesh.userData.leftArm.rotation.x = Math.sin(bTime + Math.PI) * 0.5;
                bot.mesh.userData.rightArm.rotation.x = Math.sin(bTime) * 0.5;
            }
            // Simple gravity for bots (snap to floor)
            if (bot.mesh.position.y > 0) bot.mesh.position.y -= 0.1;
            if (bot.mesh.position.y < 0) bot.mesh.position.y = 0;
        });


        // --- PLAYER PHYSICS ---
        // 1. Inputs
        const moveDir = new THREE.Vector3(0, 0, 0);
        let isMoving = false;
        
        if (!isChatFocused) {
            if (keysPressed.current.has('KeyW') || keysPressed.current.has('w')) moveDir.z -= 1;
            if (keysPressed.current.has('KeyS') || keysPressed.current.has('s')) moveDir.z += 1;
            if (keysPressed.current.has('KeyA') || keysPressed.current.has('a')) moveDir.x -= 1;
            if (keysPressed.current.has('KeyD') || keysPressed.current.has('d')) moveDir.x += 1;
        }

        if (moveDir.length() > 0) {
            moveDir.normalize();
            isMoving = true;
            const targetRot = Math.atan2(moveDir.x, moveDir.z);
            let rotDiff = targetRot - myPlayer.rotation.y;
            while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
            while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
            myPlayer.rotation.y += rotDiff * 0.2;
        }

        velocity.y -= GRAVITY;
        if (!isChatFocused && isGrounded && (keysPressed.current.has('Space') || keysPressed.current.has(' '))) {
            velocity.y = JUMP_FORCE;
            isGrounded = false;
        }

        const nextY = position.y + velocity.y;
        const hitY = checkCollision(new THREE.Vector3(position.x, nextY, position.z));
        if (hitY) {
            if (velocity.y < 0) { position.y = hitY.max.y; velocity.y = 0; isGrounded = true; } 
            else { position.y = hitY.min.y - 5.01; velocity.y = 0; }
        } else {
            position.y = nextY;
            isGrounded = false;
        }
        if (position.y < -50) { position.set(0, 20, 0); velocity.set(0, 0, 0); }

        if (isMoving) {
            const step = moveDir.multiplyScalar(MOVE_SPEED);
            let nextX = position.x + step.x;
            if (!checkCollision(new THREE.Vector3(nextX, position.y + 0.1, position.z))) position.x = nextX;
            let nextZ = position.z + step.z;
            if (!checkCollision(new THREE.Vector3(position.x, position.y + 0.1, nextZ))) position.z = nextZ;
            animTime += 0.35;
        } else { animTime = 0; }

        myPlayer.position.copy(position);

        // Player Animation
        const { leftLeg, rightLeg, leftArm, rightArm } = myPlayer.userData;
        if (!isGrounded) {
            leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, Math.PI, 0.2);
            rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, Math.PI, 0.2);
        } else if (isMoving) {
            leftLeg.rotation.x = Math.sin(animTime) * 0.8;
            rightLeg.rotation.x = Math.sin(animTime + Math.PI) * 0.8;
            leftArm.rotation.x = Math.sin(animTime + Math.PI) * 0.8;
            rightArm.rotation.x = Math.sin(animTime) * 0.8;
        } else {
            leftLeg.rotation.x = 0; rightLeg.rotation.x = 0;
            leftArm.rotation.x = 0; rightArm.rotation.x = 0;
        }

        // Camera Follow
        const cameraOffset = new THREE.Vector3(0, 8, 14);
        const targetCamPos = position.clone().add(cameraOffset);
        camera.position.lerp(targetCamPos, 0.15);
        camera.lookAt(position.clone().add(new THREE.Vector3(0, 4, 0)));

        renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
    };
  }, [isPlaying, loadingProgress, game, isChatFocused]);


  if (!game) {
    return (
      <div className="p-10 text-center text-gray-400">
        <h2 className="text-2xl font-bold mb-4">Experience not found</h2>
        <Link to="/" className="text-blue-500 hover:underline">Return Home</Link>
      </div>
    );
  }

  // Simulated Game Client Overlay
  if (isPlaying) {
    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col font-sans select-none touch-none">
            {/* Game Top Bar (Roblox Client Style) */}
            <div className="h-12 bg-[#232527] flex items-center justify-between px-4 select-none shadow-md z-10">
                <div className="flex items-center gap-4">
                    <button className="w-8 h-8 bg-gray-700/50 hover:bg-gray-700 rounded flex items-center justify-center">
                        <div className="w-4 h-4 bg-gray-300 rotate-45 rounded-[1px]"></div>
                    </button>
                    <span className="font-bold text-white text-lg tracking-wide hidden sm:block">{game.title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="bg-gray-800/80 px-3 py-1 rounded text-xs text-gray-300 font-mono border border-gray-700 hidden sm:block">
                        Mem: 245MB | Ping: 45ms
                    </div>
                    <button onClick={stopGame} className="w-10 h-10 hover:bg-red-600 rounded transition-colors flex items-center justify-center">
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>

            {/* Game Canvas / Loading Screen */}
            <div className="flex-1 relative bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                {loadingProgress < 100 ? (
                    <div className="w-full h-full absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-900 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mb-8 rotate-45 animate-bounce shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                             <div className="w-10 h-10 bg-gray-200 rounded-sm"></div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-white mb-6 tracking-wider drop-shadow-lg">BloxClone</h3>
                        <div className="w-64 bg-gray-800 h-2 rounded-full overflow-hidden border border-gray-700">
                            <div className="bg-blue-500 h-full transition-all duration-200 ease-out" style={{ width: `${loadingProgress}%` }}></div>
                        </div>
                        <p className="mt-4 text-gray-400 text-sm font-semibold animate-pulse">Loading Assets...</p>
                    </div>
                ) : (
                    <div className="relative w-full h-full">
                        {/* Three.js Mount Point */}
                        <div ref={mountRef} className="w-full h-full cursor-none" />
                        
                        {/* --- MOBILE TOUCH CONTROLS (Only visible on small screens or by default for this demo) --- */}
                        <div className="absolute inset-0 pointer-events-none z-30 block md:hidden">
                            {/* D-Pad (Left) */}
                            <div className="absolute bottom-16 left-8 w-40 h-40 bg-white/10 rounded-full backdrop-blur-sm pointer-events-auto touch-none">
                                <button 
                                    className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center active:bg-white/40"
                                    onTouchStart={() => handleTouchStart('w')} onTouchEnd={() => handleTouchEnd('w')}
                                >
                                    <ArrowUp className="w-6 h-6 text-white" />
                                </button>
                                <button 
                                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center active:bg-white/40"
                                    onTouchStart={() => handleTouchStart('s')} onTouchEnd={() => handleTouchEnd('s')}
                                >
                                    <ArrowDown className="w-6 h-6 text-white" />
                                </button>
                                <button 
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center active:bg-white/40"
                                    onTouchStart={() => handleTouchStart('a')} onTouchEnd={() => handleTouchEnd('a')}
                                >
                                    <ArrowLeft className="w-6 h-6 text-white" />
                                </button>
                                <button 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center active:bg-white/40"
                                    onTouchStart={() => handleTouchStart('d')} onTouchEnd={() => handleTouchEnd('d')}
                                >
                                    <ArrowRight className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            {/* Jump Button (Right) */}
                            <div className="absolute bottom-20 right-8 w-24 h-24 pointer-events-auto touch-none">
                                <button 
                                    className="w-full h-full bg-white/10 rounded-full backdrop-blur-sm border-2 border-white/30 flex items-center justify-center active:bg-white/30 active:scale-95 transition-transform"
                                    onTouchStart={() => handleTouchStart(' ')} onTouchEnd={() => handleTouchEnd(' ')}
                                >
                                    <ArrowUp className="w-10 h-10 text-white stroke-[3]" />
                                </button>
                            </div>
                        </div>

                        {/* --- IN-GAME CHAT UI --- */}
                        <div className="absolute top-4 left-4 w-64 sm:w-80 flex flex-col gap-2 pointer-events-auto z-20">
                            <div className={`bg-black/50 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col transition-all duration-200 ${isChatFocused ? 'opacity-100 ring-2 ring-white/20' : 'opacity-80 hover:opacity-100'}`}>
                                <div className="h-32 sm:h-48 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-600" style={{scrollbarWidth: 'thin'}}>
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className="text-sm break-words leading-tight shadow-black drop-shadow-md">
                                            {msg.isSystem ? (
                                                <span className="font-bold text-red-500 italic">{msg.sender}: {msg.text}</span>
                                            ) : (
                                                <>
                                                    <span className="font-bold" style={{ color: msg.color }}>[{msg.sender}]: </span>
                                                    <span className="text-white font-medium">{msg.text}</span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                                
                                {isChatFocused && (
                                    <form onSubmit={handleSendChat} className="bg-black/60 p-2 flex gap-2 border-t border-white/10">
                                        <input 
                                            ref={chatInputRef}
                                            type="text" 
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="To chat click here or press / key"
                                            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-400"
                                            maxLength={200}
                                        />
                                        <button type="submit"><Send className="w-4 h-4 text-white" /></button>
                                    </form>
                                )}
                            </div>
                            {!isChatFocused && (
                                <div className="text-xs text-gray-400 bg-black/30 w-fit px-2 py-1 rounded backdrop-blur-sm border border-white/10 hidden sm:block">
                                    Press <kbd className="bg-gray-700 px-1 rounded text-white font-sans">/</kbd> to chat
                                </div>
                            )}
                        </div>

                        {/* Fake In-Game GUI Overlay (Right) */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none hidden sm:flex">
                            <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg text-white text-xs font-bold shadow-sm">
                                <h4 className="uppercase text-gray-400 mb-1">Leaderboard</h4>
                                <div className="flex justify-between w-32"><span>{user?.username || 'Guest'}</span> <span>100</span></div>
                                <div className="flex justify-between w-32 text-gray-400"><span>Noob123</span> <span>50</span></div>
                                <div className="flex justify-between w-32 text-gray-400"><span>CoolCat_99</span> <span>12</span></div>
                            </div>
                        </div>

                        <div className="absolute bottom-6 left-6 flex items-center gap-2 pointer-events-none opacity-70 hidden sm:flex">
                            <div className="bg-black/50 p-2 rounded text-white text-xs">
                                <span className="font-bold border border-white/30 px-1 rounded mr-1">W</span>
                                <span className="font-bold border border-white/30 px-1 rounded mr-1">A</span>
                                <span className="font-bold border border-white/30 px-1 rounded mr-1">S</span>
                                <span className="font-bold border border-white/30 px-1 rounded mr-1">D</span>
                                to Walk &nbsp;
                                <span className="font-bold border border-white/30 px-1 rounded mr-1">SPACE</span>
                                to Jump
                            </div>
                        </div>

                        {/* Chat Button for Mobile */}
                        <div className="absolute top-16 left-4 pointer-events-auto sm:hidden">
                             <button onClick={() => { setIsChatFocused(!isChatFocused); if(!isChatFocused) setTimeout(() => chatInputRef.current?.focus(), 10); }} className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                                <MessageSquare className="w-5 h-5 fill-current" />
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="bg-[#1f2937] rounded-xl overflow-hidden shadow-2xl">
        {/* Banner Area */}
        <div className="h-48 md:h-80 w-full overflow-hidden relative">
            <img 
                src={game.thumbnail} 
                alt={game.title} 
                className="w-full h-full object-cover blur-sm opacity-50 absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f2937] to-transparent" />
        </div>

        {/* Content Area */}
        <div className="p-8 -mt-20 relative z-20">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Thumbnail & Actions */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                     <img 
                        src={game.thumbnail} 
                        alt={game.title}
                        className="w-full aspect-video object-cover rounded-lg shadow-lg border-2 border-gray-700"
                    />
                    <button 
                        onClick={handlePlay}
                        className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-extrabold text-2xl py-4 rounded-lg shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-3"
                    >
                        <Play className="fill-current w-8 h-8" />
                        PLAY
                    </button>
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-2/3">
                    <div className="flex justify-between items-start">
                        <h1 className="text-4xl font-extrabold text-white mb-2">{game.title}</h1>
                        <button className="p-2 hover:bg-gray-800 rounded-full">
                            <MoreHorizontal className="text-gray-400" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-blue-400 font-semibold mb-6">
                        <span>By {game.creator}</span>
                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        <span className="text-gray-400 font-normal">{game.genre}</span>
                    </div>

                    <div className="flex gap-8 border-b border-gray-700 pb-6 mb-6">
                        <div className="text-center">
                            <div className="text-lg font-bold text-white mb-1">{game.players.toLocaleString()}</div>
                            <div className="text-xs text-gray-400 font-bold uppercase">Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-white mb-1">{(game.likes / 1000).toFixed(1)}B+</div>
                            <div className="text-xs text-gray-400 font-bold uppercase">Visits</div>
                        </div>
                         <div className="text-center">
                            <div className="text-lg font-bold text-white mb-1 flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" /> {game.likes}%
                            </div>
                            <div className="text-xs text-gray-400 font-bold uppercase">Rating</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6">
                        <h3 className="font-bold text-white mb-2">Description</h3>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                            {game.description}
                            <br /><br />
                            Tags: #Roleplay #City #Fun #BloxClone
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded border border-gray-600" title="Favorite">
                            <Star className="w-6 h-6" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded border border-gray-600" title="Vote Up">
                            <ThumbsUp className="w-6 h-6" />
                        </button>
                         <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded border border-gray-600" title="Vote Down">
                            <ThumbsDown className="w-6 h-6" />
                        </button>
                         <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded border border-gray-600 ml-auto" title="Share">
                            <Share2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;