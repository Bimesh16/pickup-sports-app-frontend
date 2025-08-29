import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const BUTTON_SIZES = {
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: Theme.typography.fontSize.sm,
    borderRadius: Theme.borderRadius.lg,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    fontSize: Theme.typography.fontSize.base,
    borderRadius: Theme.borderRadius.xl,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    fontSize: Theme.typography.fontSize.lg,
    borderRadius: Theme.borderRadius.xl,
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const sizeConfig = BUTTON_SIZES[size];
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...sizeConfig,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Theme.spacing[2],
      opacity: isDisabled ? 0.6 : 1,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: Colors.primary[500],
          shadowColor: Colors.shadow.colored,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: Colors.secondary[500],
          shadowColor: Colors.shadow.medium,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: Colors.primary[500],
          borderWidth: 2,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'gradient':
        return baseStyle;
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: sizeConfig.fontSize,
      fontWeight: Theme.typography.fontWeight.semibold,
      textAlign: 'center',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: Colors.text.inverse,
        };
      case 'secondary':
        return {
          ...baseTextStyle,
          color: Colors.text.inverse,
        };
      case 'outline':
        return {
          ...baseTextStyle,
          color: Colors.primary[500],
        };
      case 'ghost':
        return {
          ...baseTextStyle,
          color: Colors.primary[500],
        };
      case 'gradient':
        return {
          ...baseTextStyle,
          color: Colors.text.inverse,
        };
      default:
        return baseTextStyle;
    }
  };

  const ButtonContent = () => (
    <>
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary[500] : Colors.text.inverse}
        />
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      {!loading && icon && iconPosition === 'right' && icon}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[{ borderRadius: sizeConfig.borderRadius }, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            getButtonStyle(),
            {
              shadowColor: Colors.shadow.colored,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 12,
            }
          ]}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[getButtonStyle(), style]}
      activeOpacity={0.8}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
}

// Preset button variants for common use cases
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="secondary" />;
}

export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="outline" />;
}

export function GradientButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="gradient" />;
}
