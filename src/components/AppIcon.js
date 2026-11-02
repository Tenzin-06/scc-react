import { StyleSheet, View } from 'react-native';

export default function AppIcon({ color = '#666666', name, size = 20 }) {
  const iconStyle = { height: size, width: size };

  if (name === 'user' || name === 'profile') {
    return (
      <View style={[styles.icon, iconStyle]}>
        <View style={[styles.userHead, { borderColor: color }]} />
        <View style={[styles.userBody, { borderColor: color }]} />
      </View>
    );
  }

  if (name === 'edit') {
    return (
      <View style={[styles.icon, iconStyle, styles.rotate]}>
        <View style={[styles.pencil, { backgroundColor: color }]} />
        <View style={[styles.pencilTip, { borderTopColor: color }]} />
      </View>
    );
  }

  if (name === 'calendar' || name === 'events') {
    return (
      <View style={[styles.icon, iconStyle, { borderColor: color, borderWidth: 1.5, borderRadius: 3 }]}>
        <View style={[styles.calendarLine, { backgroundColor: color }]} />
        <View style={[styles.calendarRing, { borderColor: color, left: size * 0.25 }]} />
        <View style={[styles.calendarRing, { borderColor: color, right: size * 0.25 }]} />
      </View>
    );
  }

  if (name === 'bell') {
    return (
      <View style={[styles.icon, iconStyle]}>
        <View style={[styles.bell, { borderColor: color }]} />
        <View style={[styles.bellClapper, { backgroundColor: color, left: size * 0.43 }]} />
      </View>
    );
  }

  if (name === 'settings') {
    return (
      <View style={[styles.icon, iconStyle, styles.settings, { borderColor: color }]}>
        <View style={[styles.settingsCore, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'logout') {
    return (
      <View style={[styles.icon, iconStyle]}>
        <View style={[styles.logoutDoor, { borderColor: color }]} />
        <View style={[styles.logoutArrow, { backgroundColor: color, top: size * 0.46 }]} />
        <View style={[styles.logoutArrowHead, { borderColor: color, top: size * 0.31 }]} />
      </View>
    );
  }

  if (name === 'home') {
    return (
      <View style={[styles.icon, iconStyle]}>
        <View style={[styles.homeRoof, { borderColor: color }]} />
        <View style={[styles.homeBase, { borderColor: color }]} />
      </View>
    );
  }

  if (name === 'clubs') {
    return (
      <View style={[styles.icon, iconStyle]}>
        <View style={[styles.clubCircle, { borderColor: color, left: size * 0.12 }]} />
        <View style={[styles.clubCircle, { borderColor: color, right: size * 0.12 }]} />
        <View style={[styles.clubBase, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'search') {
    return (
      <View style={[styles.icon, iconStyle]}>
        <View style={[styles.searchLens, { borderColor: color }]} />
        <View style={[styles.searchHandle, { backgroundColor: color }]} />
      </View>
    );
  }

  return <View style={[styles.icon, iconStyle]} />;
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  userHead: {
    borderRadius: 99,
    borderWidth: 1.5,
    height: '30%',
    position: 'absolute',
    top: '12%',
    width: '30%',
  },
  userBody: {
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRadius: 99,
    borderRightWidth: 1.5,
    height: '38%',
    position: 'absolute',
    top: '52%',
    width: '62%',
  },
  rotate: {
    transform: [{ rotate: '-45deg' }],
  },
  pencil: {
    borderRadius: 1,
    height: '18%',
    position: 'absolute',
    width: '72%',
  },
  pencilTip: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 4,
    borderLeftColor: 'transparent',
    borderLeftWidth: 4,
    borderRightColor: 'transparent',
    borderRightWidth: 4,
    borderTopWidth: 5,
    position: 'absolute',
    right: '2%',
  },
  calendarLine: {
    height: 1.5,
    position: 'absolute',
    top: '28%',
    width: '100%',
  },
  calendarRing: {
    borderTopWidth: 2,
    height: '16%',
    position: 'absolute',
    top: '-6%',
    width: '18%',
  },
  bell: {
    borderBottomWidth: 1.5,
    borderRadius: 99,
    borderTopWidth: 1.5,
    height: '62%',
    position: 'absolute',
    top: '12%',
    width: '62%',
  },
  bellClapper: {
    borderRadius: 99,
    height: '12%',
    position: 'absolute',
    top: '78%',
    width: '12%',
  },
  settings: {
    borderRadius: 99,
    borderWidth: 2,
  },
  settingsCore: {
    borderRadius: 99,
    height: '30%',
    width: '30%',
  },
  logoutDoor: {
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRadius: 2,
    borderTopWidth: 1.5,
    height: '64%',
    left: '12%',
    position: 'absolute',
    top: '18%',
    width: '35%',
  },
  logoutArrow: {
    height: 1.5,
    position: 'absolute',
    right: '8%',
    width: '58%',
  },
  logoutArrowHead: {
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    height: '25%',
    position: 'absolute',
    right: '8%',
    transform: [{ rotate: '-45deg' }],
    width: '25%',
  },
  homeRoof: {
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    height: '52%',
    position: 'absolute',
    top: '12%',
    transform: [{ rotate: '45deg' }],
    width: '52%',
  },
  homeBase: {
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    bottom: '10%',
    height: '50%',
    position: 'absolute',
    width: '70%',
  },
  clubCircle: {
    borderRadius: 99,
    borderWidth: 1.5,
    height: '48%',
    position: 'absolute',
    top: '14%',
    width: '48%',
  },
  clubBase: {
    bottom: '12%',
    height: '14%',
    position: 'absolute',
    width: '70%',
  },
  searchLens: {
    borderRadius: 99,
    borderWidth: 1.5,
    height: '58%',
    left: '12%',
    position: 'absolute',
    top: '10%',
    width: '58%',
  },
  searchHandle: {
    height: 1.5,
    position: 'absolute',
    right: '8%',
    top: '73%',
    transform: [{ rotate: '45deg' }],
    width: '36%',
  },
});
