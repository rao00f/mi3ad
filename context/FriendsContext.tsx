import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  mutualFriends: number;
  bio?: string;
  location?: string;
  joinedDate: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: Friend;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  user: Friend;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  expiresAt: string;
  viewers: string[];
  isViewed: boolean;
}

interface FriendsContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  stories: Story[];
  isLoading: boolean;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<Friend[]>;
  getFriendById: (id: string) => Friend | undefined;
  getPendingRequestsCount: () => number;
  addStory: (imageUrl: string, caption?: string) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;
  getActiveStories: () => Story[];
  getUserStories: (userId: string) => Story[];
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

// Active mock data for friends
const initialFriends: Friend[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    mutualFriends: 12,
    bio: 'مطور تطبيقات ومصور',
    location: 'طرابلس، ليبيا',
    joinedDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'فاطمة علي',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    isOnline: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    mutualFriends: 8,
    bio: 'مصممة جرافيك',
    location: 'بنغازي، ليبيا',
    joinedDate: '2023-03-20',
  },
  {
    id: '3',
    name: 'عمر الصادق',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    mutualFriends: 15,
    bio: 'طالب هندسة',
    location: 'مصراتة، ليبيا',
    joinedDate: '2023-02-10',
  },
  {
    id: '4',
    name: 'مريم الهادي',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    mutualFriends: 6,
    bio: 'طبيبة أطفال',
    location: 'سبها، ليبيا',
    joinedDate: '2023-04-05',
  },
];

// Active mock data for friend requests
const initialFriendRequests: FriendRequest[] = [
  {
    id: '1',
    fromUserId: '5',
    toUserId: 'current-user',
    fromUser: {
      id: '5',
      name: 'سارة أحمد',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      mutualFriends: 3,
      location: 'طرابلس، ليبيا',
      joinedDate: '2023-05-01',
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    fromUserId: '6',
    toUserId: 'current-user',
    fromUser: {
      id: '6',
      name: 'يوسف الطاهر',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
      isOnline: false,
      lastSeen: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      mutualFriends: 7,
      location: 'بنغازي، ليبيا',
      joinedDate: '2023-04-20',
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// Active mock data for stories
const initialStories: Story[] = [
  {
    id: '1',
    userId: '1',
    user: initialFriends[0],
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    caption: 'يوم جميل في طرابلس! 🌅',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    viewers: [],
    isViewed: false,
  },
  {
    id: '2',
    userId: '2',
    user: initialFriends[1],
    imageUrl: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
    caption: 'مشروع جديد 🎨',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    viewers: ['current-user'],
    isViewed: true,
  },
  {
    id: '3',
    userId: '3',
    user: initialFriends[2],
    imageUrl: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
    caption: 'في الجامعة 📚',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    viewers: [],
    isViewed: false,
  },
];

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(initialFriendRequests);
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFriendsData();
    // Simulate new friend requests and stories
    const interval = setInterval(() => {
      simulateNewActivity();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const loadFriendsData = async () => {
    try {
      const [friendsData, requestsData, storiesData] = await Promise.all([
        AsyncStorage.getItem('friends'),
        AsyncStorage.getItem('friendRequests'),
        AsyncStorage.getItem('stories'),
      ]);

      if (friendsData) {
        const parsed = JSON.parse(friendsData);
        setFriends([...initialFriends, ...parsed]);
      }
      if (requestsData) {
        const parsed = JSON.parse(requestsData);
        setFriendRequests([...initialFriendRequests, ...parsed]);
      }
      if (storiesData) {
        const parsed = JSON.parse(storiesData);
        setStories([...initialStories, ...parsed]);
      }
    } catch (error) {
      console.error('Error loading friends data:', error);
    }
  };

  const saveFriendsData = async () => {
    try {
      // Only save user-generated data, not initial data
      const userFriends = friends.filter(f => !initialFriends.some(initial => initial.id === f.id));
      const userRequests = friendRequests.filter(r => !initialFriendRequests.some(initial => initial.id === r.id));
      const userStories = stories.filter(s => !initialStories.some(initial => initial.id === s.id));

      await Promise.all([
        AsyncStorage.setItem('friends', JSON.stringify(userFriends)),
        AsyncStorage.setItem('friendRequests', JSON.stringify(userRequests)),
        AsyncStorage.setItem('stories', JSON.stringify(userStories)),
      ]);
    } catch (error) {
      console.error('Error saving friends data:', error);
    }
  };

  const simulateNewActivity = () => {
    // Randomly add new friend requests or stories
    const activities = ['friend_request', 'story'];
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];

    if (randomActivity === 'friend_request' && friendRequests.length < 5) {
      // Add a new friend request
      const newRequest: FriendRequest = {
        id: Date.now().toString(),
        fromUserId: `user_${Date.now()}`,
        toUserId: 'current-user',
        fromUser: {
          id: `user_${Date.now()}`,
          name: 'مستخدم جديد',
          avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
          isOnline: true,
          lastSeen: new Date().toISOString(),
          mutualFriends: Math.floor(Math.random() * 10),
          location: 'ليبيا',
          joinedDate: new Date().toISOString(),
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setFriendRequests(prev => [newRequest, ...prev]);
      saveFriendsData();
    } else if (randomActivity === 'story' && friends.length > 0) {
      // Add a new story from a random friend
      const randomFriend = friends[Math.floor(Math.random() * friends.length)];
      const newStory: Story = {
        id: Date.now().toString(),
        userId: randomFriend.id,
        user: randomFriend,
        imageUrl: 'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg',
        caption: 'قصة جديدة! ✨',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        viewers: [],
        isViewed: false,
      };

      setStories(prev => [newStory, ...prev]);
      saveFriendsData();
    }
  };

  const sendFriendRequest = async (userId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Friend request sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: string): Promise<void> => {
    try {
      const request = friendRequests.find(req => req.id === requestId);
      if (!request) return;

      // Add to friends list
      const newFriend: Friend = {
        ...request.fromUser,
        isOnline: Math.random() > 0.5,
      };

      setFriends(prev => [...prev, newFriend]);
      
      // Remove from requests
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      await saveFriendsData();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  };

  const rejectFriendRequest = async (requestId: string): Promise<void> => {
    try {
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      await saveFriendsData();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  };

  const removeFriend = async (friendId: string): Promise<void> => {
    try {
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
      await saveFriendsData();
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  };

  const searchUsers = async (query: string): Promise<Friend[]> => {
    try {
      // Simulate API search
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock search results
      const mockResults: Friend[] = [
        {
          id: '7',
          name: 'خالد الشريف',
          avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
          isOnline: true,
          lastSeen: new Date().toISOString(),
          mutualFriends: 2,
          location: 'طرابلس، ليبيا',
          joinedDate: '2023-06-01',
        },
        {
          id: '8',
          name: 'نور الدين',
          avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
          isOnline: false,
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          mutualFriends: 5,
          location: 'بنغازي، ليبيا',
          joinedDate: '2023-05-15',
        },
      ];

      return mockResults.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const getFriendById = (id: string): Friend | undefined => {
    return friends.find(friend => friend.id === id);
  };

  const getPendingRequestsCount = (): number => {
    return friendRequests.filter(req => req.status === 'pending').length;
  };

  const addStory = async (imageUrl: string, caption?: string): Promise<void> => {
    try {
      const newStory: Story = {
        id: Date.now().toString(),
        userId: 'current-user',
        user: {
          id: 'current-user',
          name: 'أنت',
          avatar: '',
          isOnline: true,
          lastSeen: new Date().toISOString(),
          mutualFriends: 0,
          joinedDate: '2023-01-01',
        },
        imageUrl,
        caption,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        viewers: [],
        isViewed: false,
      };

      setStories(prev => [newStory, ...prev]);
      await saveFriendsData();
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  };

  const viewStory = async (storyId: string): Promise<void> => {
    try {
      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { 
                ...story, 
                isViewed: true,
                viewers: [...story.viewers, 'current-user']
              }
            : story
        )
      );
      await saveFriendsData();
    } catch (error) {
      console.error('Error viewing story:', error);
    }
  };

  const getActiveStories = (): Story[] => {
    const now = new Date();
    return stories.filter(story => new Date(story.expiresAt) > now);
  };

  const getUserStories = (userId: string): Story[] => {
    return getActiveStories().filter(story => story.userId === userId);
  };

  const value: FriendsContextType = {
    friends,
    friendRequests,
    stories,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
    getFriendById,
    getPendingRequestsCount,
    addStory,
    viewStory,
    getActiveStories,
    getUserStories,
  };

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

export function useFriends() {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
}