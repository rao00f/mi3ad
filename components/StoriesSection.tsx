import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useFriends, Story } from '@/context/FriendsContext';
import { Plus, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

interface StoriesSectionProps {
  onAddStory?: () => void;
}

export default function StoriesSection({ onAddStory }: StoriesSectionProps) {
  const { theme } = useTheme();
  const { getActiveStories, addStory, viewStory } = useFriends();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);

  const activeStories = getActiveStories();

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    
    if (showStoryModal && selectedStory) {
      setStoryProgress(0);
      progressTimer = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            setTimeout(() => {
              setShowStoryModal(false);
            }, 300);
            return 100;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds total duration
    }
    
    return () => {
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [showStoryModal, selectedStory]);

  const handleAddStory = async () => {
    try {
      setIsAddingStory(true);
      
      // For web, simulate adding a story with a random image
      if (Platform.OS === 'web') {
        const randomImageId = Math.floor(Math.random() * 1000);
        const randomImage = `https://picsum.photos/seed/${randomImageId}/800/1200`;
        await addStory(randomImage, 'قصة جديدة!');
        if (onAddStory) onAddStory();
        setIsAddingStory(false);
        return;
      }
      
      // For mobile
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addStory(result.assets[0].uri, 'قصة جديدة!');
        if (onAddStory) onAddStory();
      }
    } catch (error) {
      console.error('Error adding story:', error);
    } finally {
      setIsAddingStory(false);
    }
  };

  const handleStoryPress = async (story: Story) => {
    setSelectedStory(story);
    setShowStoryModal(true);
    if (!story.isViewed) {
      await viewStory(story.id);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = (now.getTime() - storyDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} س`;
    } else {
      return `${Math.floor(diffInHours / 24)} د`;
    }
  };

  const styles = StyleSheet.create({
    container: {
      paddingVertical: 16,
    },
    storiesScroll: {
      paddingHorizontal: 16,
    },
    storyItem: {
      alignItems: 'center',
      marginRight: 12,
      width: 70,
    },
    addStoryItem: {
      alignItems: 'center',
      marginRight: 12,
      width: 70,
    },
    storyImageContainer: {
      position: 'relative',
      marginBottom: 8,
    },
    storyImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    addStoryContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    storyGradientBorder: {
      width: 68,
      height: 68,
      borderRadius: 34,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 2,
    },
    viewedStoryBorder: {
      width: 68,
      height: 68,
      borderRadius: 34,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    storyName: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.text,
      textAlign: 'center',
      maxWidth: 70,
    },
    addStoryText: {
      fontSize: 12,
      fontFamily: 'Cairo-SemiBold',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      maxWidth: 70,
    },
    // Story Modal Styles
    storyModal: {
      flex: 1,
      backgroundColor: 'black',
    },
    storyModalContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    storyModalImage: {
      width: width,
      height: height * 0.8,
      resizeMode: 'cover',
    },
    storyModalHeader: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      zIndex: 1000,
    },
    storyProgressBar: {
      flex: 1,
      height: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 1,
      marginRight: 16,
    },
    storyProgress: {
      height: '100%',
      backgroundColor: 'white',
      borderRadius: 1,
    },
    closeStoryButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    storyUserInfo: {
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1000,
    },
    storyUserAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    storyUserDetails: {
      flex: 1,
    },
    storyUserName: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      color: 'white',
      marginBottom: 2,
    },
    storyTime: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    storyCaption: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      right: 20,
      zIndex: 1000,
    },
    storyCaptionText: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: 'white',
      textAlign: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
  });

  return (
    <>
      <View style={styles.container}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesScroll}
        >
          {/* Add Story Button */}
          <TouchableOpacity 
            style={styles.addStoryItem} 
            onPress={handleAddStory}
            disabled={isAddingStory}
            activeOpacity={0.7}
          >
            <View style={styles.addStoryContainer}>
              {isAddingStory ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Plus size={24} color={theme.colors.textSecondary} />
              )}
            </View>
            <Text style={styles.addStoryText}>
              {isAddingStory ? 'جاري...' : 'قصتك'}
            </Text>
          </TouchableOpacity>

          {/* Stories */}
          {activeStories.map((story) => (
            <TouchableOpacity
              key={story.id}
              style={styles.storyItem}
              onPress={() => handleStoryPress(story)}
              activeOpacity={0.7}
            >
              <View style={styles.storyImageContainer}>
                {story.isViewed ? (
                  <View style={styles.viewedStoryBorder}>
                    <Image source={{ uri: story.user.avatar || story.imageUrl }} style={styles.storyImage} />
                  </View>
                ) : (
                  <LinearGradient
                    colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                    style={styles.storyGradientBorder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image source={{ uri: story.user.avatar || story.imageUrl }} style={styles.storyImage} />
                  </LinearGradient>
                )}
              </View>
              <Text style={styles.storyName} numberOfLines={1}>
                {story.user.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Story Modal */}
      <Modal
        visible={showStoryModal}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowStoryModal(false)}
      >
        <View style={styles.storyModal}>
          {selectedStory && (
            <View style={styles.storyModalContent}>
              {/* Progress Bar */}
              <View style={styles.storyModalHeader}>
                <View style={styles.storyProgressBar}>
                  <View style={[styles.storyProgress, { width: `${storyProgress}%` }]} />
                </View>
                <TouchableOpacity
                  style={styles.closeStoryButton}
                  onPress={() => setShowStoryModal(false)}
                  activeOpacity={0.7}
                >
                  <X size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* User Info */}
              <View style={styles.storyUserInfo}>
                <Image 
                  source={{ uri: selectedStory.user.avatar || selectedStory.imageUrl }} 
                  style={styles.storyUserAvatar} 
                />
                <View style={styles.storyUserDetails}>
                  <Text style={styles.storyUserName}>{selectedStory.user.name}</Text>
                  <Text style={styles.storyTime}>{formatTimeAgo(selectedStory.createdAt)}</Text>
                </View>
              </View>

              {/* Story Image */}
              <Image source={{ uri: selectedStory.imageUrl }} style={styles.storyModalImage} />

              {/* Caption */}
              {selectedStory.caption && (
                <View style={styles.storyCaption}>
                  <Text style={styles.storyCaptionText}>{selectedStory.caption}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}