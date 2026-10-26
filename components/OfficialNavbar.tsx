import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

import { useTheme } from '../context/ThemeContext';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface OfficialNavbarProps {
  currentRoute?: keyof RootStackParamList;
}

export const OfficialNavbar: React.FC<OfficialNavbarProps> = ({ currentRoute }) => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const isCompact = width < 860;
  const { theme, isDark } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [officerName, setOfficerName] = useState<string>('');
  const [badgeNumber, setBadgeNumber] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedName = await AsyncStorage.getItem('name');
        const storedBadge = await AsyncStorage.getItem('badgeNumber');
        if (storedName && storedBadge) {
          setOfficerName(storedName);
          setBadgeNumber(storedBadge);
          setIsLoggedIn(true);
        }
      } catch {
        // Fallback silently
      }
    };
    loadUser();
  }, []);

  const activeScreen = currentRoute || (route.name as keyof RootStackParamList);

  const navItems: { label: string; route: keyof RootStackParamList }[] = [
    { label: 'Home', route: 'Home' },
    { label: 'Features', route: 'Key Features' },
    { label: 'Tools', route: 'Utilities' },
    { label: 'Vision', route: 'Vision' },
    { label: 'Contact', route: 'Contact' },
  ];

  const handleNavigate = (targetRoute: keyof RootStackParamList) => {
    setMobileMenuOpen(false);
    navigation.navigate(targetRoute as any);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.navBar, borderBottomColor: theme.navBarBorder }]}>
      {/* Authentic Gov of India Micro Tricolor Bar */}
      <View style={styles.tricolorBar}>
        <View style={styles.tricolorSaffron} />
        <View style={styles.tricolorWhite} />
        <View style={styles.tricolorGreen} />
      </View>

      {/* Top Ministry Authority Bar */}
      <View style={[styles.topAuthorityBar, { backgroundColor: theme.surfaceMuted, borderBottomColor: theme.border }]}>
        <View style={styles.authorityContent}>
          <Text style={[styles.authorityTextHindi, { color: theme.textPrimary }]}>भारत सरकार</Text>
          <Text style={[styles.authorityDivider, { color: theme.border }]}>|</Text>
          <Text style={[styles.authorityText, { color: theme.textSecondary }]}>Government of India</Text>
          <Text style={[styles.authorityDivider, { color: theme.border }]}>•</Text>
          <Text style={[styles.authoritySubtext, { color: theme.textMuted }]}>Legal Help & Rights Awareness</Text>
        </View>
        <View style={styles.authorityRight}>
          <Text style={[styles.officialPortalTag, isDark && { color: '#60A5FA' }]}>EDUCATIONAL AID</Text>
        </View>
      </View>

      {/* Primary Sticky Navbar */}
      <View style={[styles.mainNav, { backgroundColor: theme.navBar }]}>
        {/* Brand & Emblem */}
        <TouchableOpacity
          style={styles.brandContainer}
          onPress={() => handleNavigate('Home')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../assets/indian-emblem.png')}
            style={styles.emblem}
            resizeMode="contain"
          />
          <View style={styles.brandTextGroup}>
            <View style={styles.titleRow}>
              <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>LegalBridge-AI</Text>
              <View style={[styles.portalBadge, { backgroundColor: theme.badge, borderColor: theme.border }]}>
                <Text style={[styles.portalBadgeText, isDark && { color: '#60A5FA' }]}>PORTAL</Text>
              </View>
            </View>
            <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
              Legal Help and Rights Awareness for Everyone
            </Text>
          </View>
        </TouchableOpacity>

        {/* Desktop Navigation Links */}
        {!isCompact && (
          <View style={styles.navLinksRow}>
            {navItems.map((item) => {
              const isActive = activeScreen === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.navLink, isActive && { backgroundColor: theme.surfaceMuted }]}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.navLinkText, { color: theme.textSecondary }, isActive && { color: theme.textPrimary, fontWeight: '700' }]}>
                    {item.label}
                  </Text>
                  {isActive && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}

            {/* User Access / Login CTA */}
            <TouchableOpacity
              style={styles.officerBtn}
              onPress={() => handleNavigate(isLoggedIn ? 'Settings' : 'Login')}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isLoggedIn ? 'person-circle-outline' : 'person-outline'}
                size={16}
                color={COLORS.white}
              />
              <Text style={styles.officerBtnText}>
                {isLoggedIn ? `Profile` : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mobile Hamburger Toggle */}
        {isCompact && (
          <View style={styles.mobileRightActions}>
            <TouchableOpacity
              style={[styles.mobileOfficerBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
              onPress={() => handleNavigate(isLoggedIn ? 'Settings' : 'Login')}
            >
              <Ionicons
                name={isLoggedIn ? 'person-circle-outline' : 'person-outline'}
                size={15}
                color={isDark ? '#60A5FA' : COLORS.navyGov}
              />
              <Text style={[styles.mobileOfficerBtnText, isDark && { color: '#60A5FA' }]}>
                {isLoggedIn ? 'Profile' : 'Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hamburgerBtn, { borderColor: theme.border }]}
              onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
              activeOpacity={0.7}
              accessibilityLabel="Toggle Menu"
            >
              <Ionicons
                name={mobileMenuOpen ? 'close-outline' : 'menu-outline'}
                size={24}
                color={theme.textPrimary}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mobile Drawer Dropdown */}
      {isCompact && mobileMenuOpen && (
        <View style={[styles.mobileDropdown, { backgroundColor: theme.navBar, borderTopColor: theme.navBarBorder }]}>
          {navItems.map((item) => {
            const isActive = activeScreen === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.mobileMenuItem, isActive && { backgroundColor: theme.surfaceMuted }]}
                onPress={() => handleNavigate(item.route)}
                activeOpacity={0.7}
              >
                <Text style={[styles.mobileMenuText, { color: theme.textSecondary }, isActive && { color: theme.textPrimary, fontWeight: '700' }]}>
                  {item.label}
                </Text>
                {isActive && (
                  <Ionicons name="chevron-forward" size={16} color={isDark ? '#60A5FA' : COLORS.navyGov} />
                )}
              </TouchableOpacity>
            );
          })}

          <View style={[styles.mobileMenuDivider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            style={styles.mobileMenuOfficerAction}
            onPress={() => handleNavigate(isLoggedIn ? 'Settings' : 'Login')}
          >
            <Ionicons
              name={isLoggedIn ? 'person-circle-outline' : 'log-in-outline'}
              size={18}
              color={isDark ? '#60A5FA' : COLORS.navyGov}
            />
            <Text style={[styles.mobileMenuOfficerActionText, isDark && { color: '#60A5FA' }]}>
              {isLoggedIn ? `Profile: ${officerName || 'Citizen'}` : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 1000,
    ...SHADOWS.subtle,
  },
  tricolorBar: {
    flexDirection: 'row',
    height: 3,
    width: '100%',
  },
  tricolorSaffron: {
    flex: 1,
    backgroundColor: COLORS.govSaffron,
  },
  tricolorWhite: {
    flex: 1,
    backgroundColor: COLORS.borderDark,
  },
  tricolorGreen: {
    flex: 1,
    backgroundColor: COLORS.govGreen,
  },
  topAuthorityBar: {
    backgroundColor: COLORS.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  authorityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorityTextHindi: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.navyDark,
  },
  authorityDivider: {
    fontSize: 11,
    color: COLORS.borderDark,
  },
  authorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  authoritySubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  authorityRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officialPortalTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.navyGov,
  },
  mainNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    minHeight: 64,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emblem: {
    width: 36,
    height: 42,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.navyDark,
    letterSpacing: 0.2,
  },
  portalBadge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  portalBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.navyGov,
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navLink: {
    position: 'relative',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  navLinkActive: {
    backgroundColor: COLORS.surfaceLight,
  },
  navLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  navLinkTextActive: {
    color: COLORS.navyDark,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: COLORS.accentGold,
    borderRadius: 1,
  },
  officerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.navyGov,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: COLORS.navyMuted,
  },
  officerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  mobileRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mobileOfficerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.surfaceLight,
  },
  mobileOfficerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navyGov,
  },
  hamburgerBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mobileDropdown: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
  },
  mobileMenuItemActive: {
    backgroundColor: COLORS.surfaceMuted,
  },
  mobileMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  mobileMenuTextActive: {
    color: COLORS.navyDark,
    fontWeight: '700',
  },
  mobileMenuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  mobileMenuOfficerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  mobileMenuOfficerActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navyGov,
  },
});

export default OfficialNavbar;
