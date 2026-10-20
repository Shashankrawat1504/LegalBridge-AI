import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

type MenuBarNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MenuBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [badgeNumber, setBadgeNumber] = useState<string>('');

  const navigation = useNavigation<MenuBarNavigationProp>();
  const slideAnim = useRef<Animated.Value>(new Animated.Value(-280)).current;

  useEffect(() => {
    const getStoredData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('name');
        const storedBadgeNumber = await AsyncStorage.getItem('badgeNumber');
        if (storedName && storedBadgeNumber) {
          setName(storedName);
          setBadgeNumber(storedBadgeNumber);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage', error);
      }
    };
    getStoredData();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    Animated.timing(slideAnim, {
      toValue: isMenuOpen ? -280 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    Animated.timing(slideAnim, {
      toValue: -280,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleNavigate = (route: keyof RootStackParamList) => {
    closeMenu();
    navigation.navigate(route as any);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleMenu}
        style={styles.floatingMenuButton}
        accessibilityLabel="Open Navigation Menu"
      >
        <Ionicons name="menu-outline" size={22} color={COLORS.navyDark} />
      </TouchableOpacity>

      {isMenuOpen && (
        <>
          <TouchableOpacity style={styles.overlay} onPress={closeMenu} activeOpacity={1} />
          <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <View style={styles.headerTitleGroup}>
                <Text style={styles.menuTitle}>LegalBridge-AI Portal</Text>
                <Text style={styles.menuSubtitle}>Ministry of Law & Justice</Text>
              </View>
              <TouchableOpacity onPress={closeMenu} style={styles.closeIconButton}>
                <Ionicons name="close-outline" size={22} color={COLORS.textInverse} />
              </TouchableOpacity>
            </View>

            {/* Officer Identification */}
            {isLoggedIn ? (
              <View style={styles.officerCard}>
                <View style={styles.officerBadgeIcon}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.accentGold} />
                </View>
                <View style={styles.officerDetails}>
                  <Text style={styles.officerName}>{name}</Text>
                  <Text style={styles.officerBadgeText}>Badge ID: {badgeNumber}</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.guestCard}
                onPress={() => handleNavigate('Login')}
              >
                <Ionicons name="person-circle-outline" size={20} color="#94A3B8" />
                <Text style={styles.guestText}>Authorized Officer Sign-in</Text>
              </TouchableOpacity>
            )}

            {/* Navigation Menu Items */}
            <View style={styles.menuItems}>
              <TouchableOpacity onPress={() => handleNavigate('Home')} style={styles.menuItem}>
                <Text style={styles.menuText}>Home Portal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigate('Query')} style={styles.menuItem}>
                <Text style={styles.menuText}>AI Legal Intelligence</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigate('Bare Acts')} style={styles.menuItem}>
                <Text style={styles.menuText}>Bare Acts Repository</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigate('Database')} style={styles.menuItem}>
                <Text style={styles.menuText}>Judicial Precedent Database</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigate('FIR Download')} style={styles.menuItem}>
                <Text style={styles.menuText}>Official FIR Builder</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigate('Utilities')} style={styles.menuItem}>
                <Text style={styles.menuText}>All Operational Tools</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigate('Settings')} style={styles.menuItem}>
                <Text style={styles.menuText}>Portal Settings</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  floatingMenuButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 1000,
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    zIndex: 9998,
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: '100%',
    backgroundColor: COLORS.navyDark,
    zIndex: 9999,
    paddingTop: 48,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 16,
  },
  headerTitleGroup: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeIconButton: {
    padding: 6,
  },
  officerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  officerBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officerDetails: {
    flex: 1,
  },
  officerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  officerBadgeText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: 20,
    gap: 8,
  },
  guestText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  menuItems: {
    gap: 2,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B0A',
  },
  menuText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E2E8F0',
  },
});

export default MenuBar;
