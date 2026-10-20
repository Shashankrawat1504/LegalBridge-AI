import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, RADIUS } from '../constants/theme';

type FooterNavProp = NativeStackNavigationProp<RootStackParamList>;

const Footer: React.FC = () => {
  const navigation = useNavigation<FooterNavProp>();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  return (
    <View style={styles.footerContainer}>
      {/* Top micro tricolor */}
      <View style={styles.tricolorBar}>
        <View style={styles.saffron} />
        <View style={styles.white} />
        <View style={styles.green} />
      </View>

      <View style={styles.footerInner}>
        {/* Portal Summary */}
        <View style={[styles.sectionRow, isCompact && styles.sectionRowCompact]}>
          <View style={styles.portalInfoBlock}>
            <Text style={styles.portalTitle}>LegalBridge-AI Portal</Text>
            <Text style={styles.portalSubtitle}>
              Government of India • Ministry of Law & Justice
            </Text>
            <Text style={styles.disclaimerText}>
              An official AI-assisted legal intelligence and case documentation platform designed for law enforcement officers, judiciary personnel, and legal professionals.
            </Text>
          </View>

          {/* Quick Legal Links */}
          <View style={styles.linksGroup}>
            <Text style={styles.linksHeader}>POLICY & COMPLIANCE</Text>
            <View style={styles.linksList}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Privacy Policy')}
                style={styles.linkItem}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Terms')}
                style={styles.linkItem}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>Terms & Conditions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Accessibility')}
                style={styles.linkItem}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>Accessibility Statement</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Team')}
                style={styles.linkItem}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}></Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bottom Metadata & Copyright */}
        <View style={[styles.bottomBar, isCompact && styles.bottomBarCompact]}>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} LegalBridge-AI Portal. Developed under the Government of India Digital Initiative. All Rights Reserved.
          </Text>
          <Text style={styles.securityText}>
            Standard Security & Data Protection Compliant • IT Act, 2000
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: COLORS.navyDark,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    marginTop: 32,
  },
  tricolorBar: {
    flexDirection: 'row',
    height: 3,
    width: '100%',
  },
  saffron: {
    flex: 1,
    backgroundColor: COLORS.govSaffron,
  },
  white: {
    flex: 1,
    backgroundColor: '#94A3B8',
  },
  green: {
    flex: 1,
    backgroundColor: COLORS.govGreen,
  },
  footerInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 32,
  },
  sectionRowCompact: {
    flexDirection: 'column',
    gap: 24,
  },
  portalInfoBlock: {
    flex: 2,
    maxWidth: 600,
  },
  portalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  portalSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  linksGroup: {
    flex: 1,
    minWidth: 200,
  },
  linksHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  linksList: {
    gap: 8,
  },
  linkItem: {
    paddingVertical: 2,
  },
  linkText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  bottomBarCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  copyrightText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  securityText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default Footer;
