import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { useFriends, Friend, FriendRequest } from '@/context/FriendsContext';
import { router } from 'expo-router';
import { ArrowLeft, Search, UserPlus, Users, Clock, MapPin, Check, X, MessageCircle, MoveVertical as MoreVertical } from 'lucide-react-native';

export default function FriendsScreen() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { 
    friends, 
    friendRequests, 
    isLoading,
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend,
    searchUsers,
    sendFriendRequest,
    getPendingRequestsCount
  } = useFriends();
  
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulate refreshing friends list
    const refreshFriends = async () => {
      setIsRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsRefreshing(false);
    };

    refreshFriends();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      try {
        const results = await searchUsers(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      Alert.alert('تم الإرسال', 'تم إرسال طلب الصداقة بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إرسال طلب الصداقة');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      Alert.alert('تم القبول', 'تم قبول طلب الصداقة');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في قبول طلب الصداقة');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في رفض طلب الصداقة');
    }
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    Alert.alert(
      'إزالة صديق',
      `هل تريد إزالة ${friendName} من قائمة الأصدقاء؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إزالة',
          style: 'destructive',
          onPress: () => removeFriend(friendId)
        }
      ]
    );
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'الآن';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} د`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} س`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} يوم`;
    }
  };

  const renderFriend = (friend: Friend) => (
    <View key={friend.id} style={[styles.friendCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.friendInfo}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: friend.avatar }} style={styles.avatar} />
          {friend.isOnline && <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.success }]} />}
        </View>
        
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: theme.colors.text }]}>{friend.name}</Text>
          <View style={styles.friendMeta}>
            <View style={styles.metaItem}>
              <Clock size={12} color={theme.colors.textSecondary} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                {friend.isOnline ? 'متصل الآن' : `آخر ظهور ${formatLastSeen(friend.lastSeen)}`}
              </Text>
            </View>
            {friend.location && (
              <View style={styles.metaItem}>
                <MapPin size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{friend.location}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.mutualFriends, { color: theme.colors.textSecondary }]}>
            {friend.mutualFriends} صديق مشترك
          </Text>
        </View>
      </View>

      <View style={styles.friendActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}>
          <MessageCircle size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
          onPress={() => handleRemoveFriend(friend.id, friend.name)}
        >
          <MoreVertical size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendRequest = (request: FriendRequest) => (
    <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.friendInfo}>
        <Image source={{ uri: request.fromUser.avatar }} style={styles.avatar} />
        
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: theme.colors.text }]}>{request.fromUser.name}</Text>
          <Text style={[styles.mutualFriends, { color: theme.colors.textSecondary }]}>
            {request.fromUser.mutualFriends} صديق مشترك
          </Text>
          <Text style={[styles.requestTime, { color: theme.colors.textSecondary }]}>
            {formatLastSeen(request.createdAt)}
          </Text>
        </View>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.requestButton, { backgroundColor: theme.colors.success }]}
          onPress={() => handleAcceptRequest(request.id)}
        >
          <Check size={16} color="white" />
          <Text style={styles.requestButtonText}>قبول</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.requestButton, { backgroundColor: theme.colors.error }]}
          onPress={() => handleRejectRequest(request.id)}
        >
          <X size={16} color="white" />
          <Text style={styles.requestButtonText}>رفض</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResult = (user: Friend) => (
    <View key={user.id} style={[styles.searchResultCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.friendInfo}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: theme.colors.text }]}>{user.name}</Text>
          {user.location && (
            <View style={styles.metaItem}>
              <MapPin size={12} color={theme.colors.textSecondary} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{user.location}</Text>
            </View>
          )}
          <Text style={[styles.mutualFriends, { color: theme.colors.textSecondary }]}>
            {user.mutualFriends} صديق مشترك
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.addFriendButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => handleSendFriendRequest(user.id)}
      >
        <UserPlus size={16} color="white" />
        <Text style={styles.addFriendButtonText}>إضافة</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      flex: 1,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    activeTab: {
      backgroundColor: theme.colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    tabText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: theme.colors.text,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      margin: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    friendCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    requestCard: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    searchResultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    friendInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    friendDetails: {
      flex: 1,
    },
    friendName: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      marginBottom: 4,
    },
    friendMeta: {
      gap: 4,
      marginBottom: 4,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
    },
    mutualFriends: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
    },
    requestTime: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
    },
    friendActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    requestActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    requestButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
      gap: 6,
    },
    requestButtonText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: 'white',
    },
    addFriendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    addFriendButtonText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: 'white',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    refreshIndicator: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    refreshText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الأصدقاء</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'friends' && styles.activeTabText
            ]}>
              الأصدقاء ({friends.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'requests' && styles.activeTabText
            ]}>
              الطلبات ({getPendingRequestsCount()})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'search' && styles.activeTabText
            ]}>
              البحث
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar (only for search tab) */}
      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن أصدقاء..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            textAlign="right"
          />
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isRefreshing && (
          <View style={styles.refreshIndicator}>
            <Text style={styles.refreshText}>جاري التحديث...</Text>
          </View>
        )}

        {activeTab === 'friends' && (
          <>
            {friends.length > 0 ? (
              friends.map(renderFriend)
            ) : (
              <View style={styles.emptyState}>
                <Users size={64} color={theme.colors.border} />
                <Text style={styles.emptyStateTitle}>لا توجد أصدقاء</Text>
                <Text style={styles.emptyStateText}>ابحث عن أصدقاء جدد وابدأ في التواصل</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {friendRequests.length > 0 ? (
              friendRequests.map(renderFriendRequest)
            ) : (
              <View style={styles.emptyState}>
                <UserPlus size={64} color={theme.colors.border} />
                <Text style={styles.emptyStateTitle}>لا توجد طلبات صداقة</Text>
                <Text style={styles.emptyStateText}>ستظهر طلبات الصداقة الجديدة هنا</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'search' && (
          <>
            {isSearching ? (
              <View style={styles.refreshIndicator}>
                <Text style={styles.refreshText}>جاري البحث...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map(renderSearchResult)
            ) : searchQuery ? (
              <View style={styles.emptyState}>
                <Search size={64} color={theme.colors.border} />
                <Text style={styles.emptyStateTitle}>لا توجد نتائج</Text>
                <Text style={styles.emptyStateText}>لم يتم العثور على مستخدمين بهذا الاسم</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Search size={64} color={theme.colors.border} />
                <Text style={styles.emptyStateTitle}>ابحث عن أصدقاء</Text>
                <Text style={styles.emptyStateText}>اكتب اسم المستخدم للبحث عن أصدقاء جدد</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}