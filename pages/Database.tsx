import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Database: React.FC = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    navigation.replace('Utilities');
  }, [navigation]);

  return <View />;
};

export default Database;
