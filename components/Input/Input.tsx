import React, { forwardRef, useEffect } from 'react';
import { Easing, EasingFunction, TextInput } from 'react-native';
import styled from 'styled-components/native';
import { color, flexbox, space, borderRadius, position } from 'styled-system';
import theme from '../../src/theme';
import Box from '../Box/Box';
import { InputSizeTypes } from './types';
import { IconNameType } from '../Icon/types';
import { InputIcon } from './InputIcon';
import { InputLabel } from './InputLabel';
import { InputHelpText } from './InputHelpText';
import {
  useInputRef,
  useInputValue,
  useOutlineLabelVisibility,
  useTogglePasswordVisibility,
} from './hooks';
import { getBorderColor, getPlaceholderText } from './utils';

const BaseInput = styled(TextInput)`
  ${flexbox}
  ${color}
  ${space}
  ${position}
  ${borderRadius}
`;

type InputProps = React.ComponentPropsWithRef<typeof TextInput> & {
  size?: InputSizeTypes;
  label?: string | null | undefined;
  labelFixed?: boolean;
  placeholder?: string;
  helpText?: string | null;
  errorText?: string | null;
  successText?: string | null;
  required?: boolean;
  icon?: IconNameType | null;
  success?: boolean;
  error?: boolean;
  secureTextEntry?: boolean;
  onFocus?: (args: any) => void;
  onBlur?: (args: any) => void;
  disabled?: boolean;
  easing?: EasingFunction;
};

type TextInputHandles = Pick<
  TextInput,
  'focus' | 'clear' | 'blur' | 'isFocused' | 'setNativeProps'
>;

const Input = forwardRef<TextInputHandles, InputProps>(
  (
    {
      size = 'large',
      label,
      labelFixed,
      placeholder,
      helpText,
      errorText,
      successText,
      icon,
      success = false,
      error = false,
      secureTextEntry = false,
      required = false,
      disabled = false,
      editable = true,
      easing = Easing.inOut(Easing.ease),
      ...rest
    }: InputProps,
    ref,
  ) => {
    const [focused, setFocused] = React.useState<boolean>(false);
    const [errorState, setErrorState] = React.useState<boolean>(false);
    const [successState, setSuccessState] = React.useState<boolean>(false);
    const [iconName, setIconName] = React.useState<IconNameType | null>(
      icon ?? null,
    );
    const [variantIconName, setVariantIconName] =
      React.useState<IconNameType | null>(null);

    const innerRef = useInputRef();
    const { value, isControlled, setUncontrolledValue } = useInputValue({
      value: rest.value,
      defaultValue: rest.defaultValue,
    });

    const placeholderText = getPlaceholderText({
      label,
      labelFixed,
      placeholder,
      required,
      value,
      focused,
    });

    const borderColor = getBorderColor({ focused, successState, errorState });

    const inputHeight: number = {
      small: theme.inputStyle.height[0],
      medium: theme.inputStyle.height[1],
      large: theme.inputStyle.height[2],
    }[size];

    const {
      passwordVisibility,
      passwordVisibilityIcon,
      handlePasswordVisibility,
    } = useTogglePasswordVisibility(secureTextEntry);

    const {
      startAnimation,
      stopAnimation,
      animatedViewProps,
      animatedTextProps,
    } = useOutlineLabelVisibility({
      easing,
      inputHeight,
      focused,
      value,
      disabled,
      helpText,
      errorText,
      successText,
      errorState,
      successState,
    });

    useEffect(() => {
      setErrorState(error);
      if (!iconName && error) {
        setVariantIconName('close-fill');
      }
    }, [error, iconName]);

    useEffect(() => {
      setSuccessState(success);
      if (!iconName && success) {
        setVariantIconName('check-fill');
      }
    }, [success, iconName]);

    useEffect(() => {
      if (icon) {
        setVariantIconName(null);
        setIconName(icon);
      }
    }, [icon]);

    const handleFocus = (args: Object) => {
      if (disabled || !editable) {
        return;
      }
      startAnimation();

      setFocused(true);
      setVariantIconName(null);
      setErrorState(false);
      setSuccessState(false);

      rest.onFocus?.(args);
    };

    const handleBlur = (args: Object) => {
      if (!editable) {
        return;
      }

      if (!value) {
        stopAnimation();
      }

      setFocused(false);
      rest.onBlur?.(args);
    };

    const handleChangeText = (nextValue: string) => {
      if (!editable || disabled) {
        return;
      }

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      rest.onChangeText?.(nextValue);
    };

    React.useImperativeHandle(ref, () => ({
      focus: () => innerRef.current?.focus(),
      clear: () => innerRef.current?.clear(),
      setNativeProps: (args: Object) => innerRef.current?.setNativeProps(args),
      isFocused: () => innerRef.current?.isFocused() || false,
      blur: () => innerRef.current?.blur(),
      forceFocus: () => innerRef.current?.focus(),
    }));

    const forceFocus = () => {
      if (disabled) {
        return;
      }

      startAnimation();

      setFocused(true);
      setVariantIconName(null);
      setErrorState(false);
      setSuccessState(false);
      return innerRef.current?.focus();
    };

    return (
      <Box py={3}>
        <InputLabel
          label={label}
          labelFixed={labelFixed}
          placeholder={placeholderText}
          required={required}
          focused={focused}
          forceFocus={forceFocus}
          errorState={errorState}
          successState={successState}
          animatedViewProps={animatedViewProps}
          animatedTextProps={animatedTextProps}
          inputHeight={inputHeight}
        />
        <Box
          flexDirection="row"
          alignItems="center"
          borderWidth={1}
          borderRadius="normal"
          borderColor={borderColor}
          backgroundColor={disabled ? 'tertiaryColor' : 'white'}
          px={5}
          zIndex={0}>
          <BaseInput
            {...rest}
            //@ts-ignore
            flex={1}
            ref={innerRef}
            multiline={false}
            height={inputHeight}
            bg="transparent"
            onFocus={handleFocus}
            forceFocus={forceFocus}
            onBlur={handleBlur}
            placeholder={placeholderText}
            placeholderTextColor={theme.colors.contentTertiary as string}
            secureTextEntry={passwordVisibility}
            onChangeText={handleChangeText}
            value={value}
            disabled={disabled}
            editable={!disabled}
            style={{ fontFamily: theme.fontNames[1] }}
          />
          <InputIcon
            secureTextEntry={secureTextEntry}
            iconName={iconName}
            variantIconName={variantIconName}
            focused={focused}
            successState={successState}
            errorState={errorState}
            passwordVisibilityIcon={passwordVisibilityIcon}
            handlePasswordVisibility={handlePasswordVisibility}
          />
        </Box>
        <InputHelpText
          helpText={helpText}
          errorState={errorState}
          errorText={errorText}
          successState={successState}
          successText={successText}
        />
      </Box>
    );
  },
);

export default Input;
