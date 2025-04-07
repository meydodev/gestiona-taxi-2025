import React, { useState } from 'react';
import { Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Types';

export default function PeriodicalSelectHook(startDate: string , endDate: string) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width;

  const [startDateState, setStartDate] = useState<string | null>(startDate);
  const [endDateState, setEndDate] = useState<string | null>(endDate);

  const handleDateSelection = (date: string, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(date);
      if (endDateState && date > endDateState) {
        setEndDate(null);
      }
    } else {
      if (startDateState && date < startDateState) {
        Alert.alert("Fecha inválida", "La fecha de fin no puede ser menor a la fecha de inicio.");
        return;
      }
      setEndDate(date);
    }
  };

  const handleConfirmSelection = () => {
    if (!startDateState) {
      Alert.alert("Falta la fecha de inicio", "Por favor selecciona una fecha de inicio.");
      return;
    }
    if (!endDateState) {
      Alert.alert("Falta la fecha de fin", "Por favor selecciona una fecha de fin.");
      return;
    }

    const start = new Date(startDateState);
    const end = new Date(endDateState);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays >= 31) {
      Alert.alert("Selección inválida", "El período de selección no puede ser mayor a 31 días.");
      return;
    }

    navigation.navigate('ResumePeriodicalScreen', {
      startDate: startDateState,
      endDate: endDateState,
    });
  };

  return {
    startDateState,
    endDateState,
    handleDateSelection,
    handleConfirmSelection,
    screenWidth,
  };
}
