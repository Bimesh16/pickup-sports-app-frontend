export interface UserStats {
  gamesPlayed: number;
  gamesCreated: number;
  totalPlayTime: number; // in minutes
  averageGameDuration: number; // in minutes
  attendanceRate: number; // percentage
  currentStreak: number; // consecutive weeks
  longestStreak: number;
  favoriteSports: Array<{
    sport: string;
    count: number;
    percentage: number;
  }>;
  favoriteVenues: Array<{
    venueId: string;
    venueName: string;
    count: number;
    percentage: number;
  }>;
  preferredTimeSlots: Array<{
    timeSlot: string; // "morning", "afternoon", "evening", "night"
    count: number;
    percentage: number;
  }>;
  skillLevelProgression: Array<{
    sport: string;
    fromLevel: string;
    toLevel: string;
    changedAt: string;
  }>;
  monthlyActivity: Array<{
    month: string; // "2024-01"
    gamesCount: number;
    totalTime: number;
  }>;
}

export interface GameParticipation {
  id: string;
  gameId: string;
  gameTitle: string;
  sport: string;
  venueName: string;
  startsAt: string;
  duration: number; // in minutes
  status: 'joined' | 'created' | 'completed' | 'cancelled';
  participantsCount: number;
  maxParticipants: number;
  skillLevel: string;
  outcome?: 'win' | 'loss' | 'draw' | 'cancelled';
  rating?: number; // 1-5 stars
  notes?: string;
}

export interface UserAchievement {
  id: string;
  type: 'streak' | 'milestone' | 'social' | 'skill' | 'participation';
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  progress?: {
    current: number;
    required: number;
    percentage: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SocialConnection {
  username: string;
  displayName: string;
  avatarUrl?: string;
  gamesPlayedTogether: number;
  lastPlayedAt: string;
  favoriteSports: string[];
  skillLevel: string;
  connectionStrength: 'weak' | 'medium' | 'strong'; // based on frequency
}

export interface UserPreferences {
  favoriteSports: string[];
  preferredVenues: string[];
  preferredTimeSlots: string[];
  skillLevel: string;
  maxTravelDistance: number; // in km
  notificationPreferences: {
    gameReminders: boolean;
    socialUpdates: boolean;
    achievementAlerts: boolean;
  };
}

