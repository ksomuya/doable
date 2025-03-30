import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle, TextStyle, TextInput, TextInputProps } from 'react-native';
import { typography, colors, spacing, buttonStyles, cardStyles, formStyles } from '../styles/designSystem';

// -------------- Button Components --------------

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  icon, 
  disabled = false, 
  style, 
  textStyle 
}: ButtonProps) => {
  const buttonStyle = type === 'primary' 
    ? buttonStyles.primary 
    : type === 'secondary' 
      ? buttonStyles.secondary 
      : buttonStyles.outline;

  return (
    <TouchableOpacity
      style={[
        buttonStyle,
        disabled && buttonStyles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text 
        style={[
          buttonStyles.text, 
          type === 'outline' && { color: colors.textDark },
          textStyle
        ]}
      >
        {title}
      </Text>
      {icon}
    </TouchableOpacity>
  );
};

// -------------- Card Components --------------

interface CardProps {
  children: ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, title, style }: CardProps) => {
  return (
    <View style={[cardStyles.container, style]}>
      {title && <Text style={cardStyles.title}>{title}</Text>}
      {children}
    </View>
  );
};

// -------------- Form Components --------------

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FormInput = ({ 
  label, 
  error, 
  containerStyle, 
  ...rest 
}: FormInputProps) => {
  return (
    <View style={[formStyles.inputGroup, containerStyle]}>
      {label && <Text style={formStyles.label}>{label}</Text>}
      <TextInput 
        style={[
          formStyles.input, 
          error && { borderColor: colors.error }
        ]} 
        placeholderTextColor={colors.textLight}
        {...rest} 
      />
      {error && (
        <Text style={{ color: colors.error, fontSize: typography.caption.fontSize, marginTop: spacing.xs }}>
          {error}
        </Text>
      )}
    </View>
  );
};

// -------------- Section Header --------------

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SectionHeader = ({ 
  title, 
  subtitle, 
  rightElement, 
  style 
}: SectionHeaderProps) => {
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={typography.subtitle}>{title}</Text>
        {rightElement}
      </View>
      {subtitle && (
        <Text style={[typography.caption, { marginTop: spacing.xs }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}; 