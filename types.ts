
export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  creator: string;
  likes: number;
  players: number;
  genre: string;
}

export interface User {
  username: string;
  avatarUrl: string;
  robux: number;
  status: 'Online' | 'Offline' | 'Busy';
  inventory: string[];
  equippedItems: string[];
  avatarColors: {
    skin: string;
    shirt: string;
    pants: string;
  };
  isBanned?: boolean;
  banReason?: string;
}

export interface Friend {
  id: string;
  username: string;
  status: 'Online' | 'Offline' | 'In-Game';
  gameName?: string;
  avatarUrl: string;
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'Hat' | 'Face' | 'Gear' | 'Accessory';
  color: string;
  icon: string;
  creator?: string;
}

export enum GameGenre {
  ADVENTURE = 'Adventure',
  RPG = 'RPG',
  TYCOON = 'Tycoon',
  OBBY = 'Obby',
  SHOOTER = 'Shooter',
  SIMULATOR = 'Simulator'
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}
