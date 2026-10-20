import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import OfficialNavbar from '../components/OfficialNavbar';
import Footer from '../components/Footer';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');

  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  useEffect(() => {
    const checkLogin = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedName = await AsyncStorage.getItem('name');
      const storedBadgeNumber = await AsyncStorage.getItem('badgeNumber');
      const storedEmail = await AsyncStorage.getItem('email');

      if (storedUserId && storedName && storedBadgeNumber && storedEmail) {
        setIsLoggedIn(true);
        setUserId(storedUserId);
        setName(storedName);
        setBadgeNumber(storedBadgeNumber);
        setEmail(storedEmail);
      }
    };

    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Authentication Failed', 'Please provide valid credentials.');
      return;
    }
    const finalName = name.trim() || 'Officer In-Charge';
    const finalBadge = badgeNumber.trim() || 'IND-8842';

    setUserId(email);
    setIsLoggedIn(true);
    setName(finalName);
    setBadgeNumber(finalBadge);

    await AsyncStorage.setItem('userId', email);
    await AsyncStorage.setItem('name', finalName);
    await AsyncStorage.setItem('badgeNumber', finalBadge);
    await AsyncStorage.setItem('email', email);
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setUserId('');
    setName('');
    setBadgeNumber('');
    setEmail('');
    setPassword('');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('name');
    await AsyncStorage.removeItem('badgeNumber');
    await AsyncStorage.removeItem('email');
  };

  const toggleForm = () => {
    setIsSignup(!isSignup);
  };

  return (
    <View style={styles.container}>
      <OfficialNavbar />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainWrapper}>
          <View style={styles.authCard}>
            {/* Header / Security Badge */}
            <View style={styles.cardHeader}>
              <View style={styles.badgeBox}>
                <Ionicons
                  name={isLoggedIn ? "shield-checkmark-outline" : "lock-closed-outline"}
                  size={24}
                  color={COLORS.navyGov}
                />
              </View>
              <Text style={styles.portalTag}>OFFICIAL LAW ENFORCEMENT ACCESS</Text>
              <Text style={styles.cardTitle}>
                {isLoggedIn
                  ? 'Authenticated Officer Session'
                  : isSignup
                  ? 'Officer Portal Registration'
                  : 'Authorized Personnel Sign-In'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isLoggedIn
                  ? 'Your credentials are verified for accessing legal archives and case intelligence.'
                  : 'Authorized login for police officers, public prosecutors, and judicial staff.'}
              </Text>
            </View>

            <View style={styles.divider} />

            {isLoggedIn ? (
              <View style={styles.profileSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>OFFICER NAME</Text>
                  <Text style={styles.detailValue}>{name}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>OFFICIAL EMAIL</Text>
                  <Text style={styles.detailValue}>{email}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>BADGE / SERVICE ID</Text>
                  <Text style={styles.detailValue}>{badgeNumber}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>SESSION STATUS</Text>
                  <View style={styles.sessionStatusPill}>
                    <View style={styles.activeDot} />
                    <Text style={styles.sessionStatusText}>Active & Encrypted (TLS 1.3)</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={handleLogout}
                  activeOpacity={0.85}
                >
                  <Ionicons name="log-out-outline" size={17} color={COLORS.statusAlert} />
                  <Text style={styles.logoutBtnText}>Terminate Session & Logout</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formContainer}>
                {isSignup && (
                  <>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Full Name & Rank</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Insp. Rajesh Sharma"
                        placeholderTextColor={COLORS.textMuted}
                        value={name}
                        onChangeText={setName}
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Police / Officer Badge Number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. DL-POL-4412"
                        placeholderTextColor={COLORS.textMuted}
                        value={badgeNumber}
                        onChangeText={setBadgeNumber}
                      />
                    </View>
                  </>
                )}

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Official Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="officer@police.gov.in"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Security Passcode</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter official passcode"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleLogin}
                  activeOpacity={0.85}
                >
                  <Ionicons name="key-outline" size={16} color={COLORS.white} />
                  <Text style={styles.submitBtnText}>
                    {isSignup ? 'Complete Registration' : 'Authenticate & Sign In'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toggleBtn}
                  onPress={toggleForm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toggleText}>
                    {isSignup
                      ? 'Already registered? Access Officer Sign In'
                      : 'New department officer? Register for Access'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.legalNotice}>
                  <Text style={styles.legalNoticeText}>
                    Notice: Unauthorized access to this government portal is punishable under Section 66 of the Information Technology Act, 2000.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainWrapper: {
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 44,
  },
  authCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: {
    alignItems: 'center',
    textAlign: 'center',
  },
  badgeBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  portalTag: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGoldDark,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navyDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 420,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  formContainer: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navyDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.navyDark,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.navyGov,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.navyMuted,
    ...SHADOWS.subtle,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  toggleBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navyGov,
  },
  legalNotice: {
    backgroundColor: COLORS.surfaceMuted,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.borderDark,
    padding: 10,
    borderRadius: RADIUS.sm,
    marginTop: 8,
  },
  legalNoticeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    textAlign: 'center',
  },
  profileSection: {
    gap: 16,
  },
  detailRow: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navyDark,
  },
  sessionStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.statusSuccess,
  },
  sessionStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.statusSuccess,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.statusAlertBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    marginTop: 8,
  },
  logoutBtnText: {
    color: COLORS.statusAlert,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default Login;
