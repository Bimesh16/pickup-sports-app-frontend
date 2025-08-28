import React, { useEffect, useMemo, useState } from 'react';
import {
    Button as RNButton,
    KeyboardAvoidingView,
    Platform,
    StyleSheet as RNStyleSheet,
    TextInput as RNTextInput,
    View as RNBaseView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text as TText, View as TView } from '@/components/Themed';
import { useToast } from '@/src/components/ToastProvider';
import { useForgotPassword } from '@/src/features/auth/hooks/useForgotPassword';
import { getRemainingSeconds, useResendCooldown } from '@/src/stores/resendCooldown';

export default function ForgotPasswordScreen() {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const forgot = useForgotPassword();
    const toast = useToast();
    const router = useRouter();
    const { markSent } = useResendCooldown();

    const error = useMemo(
        () => (!usernameOrEmail.trim() ? 'Username or email is required' : null),
        [usernameOrEmail]
    );

    // Cooldown (60s) per identifier
    const key = React.useMemo(() => `forgot:${usernameOrEmail.trim()}`, [usernameOrEmail]);
    const [cooldownLeft, setCooldownLeft] = useState<number>(0);
    useEffect(() => {
        setCooldownLeft(getRemainingSeconds(key, 60_000));
        const t = setInterval(() => setCooldownLeft(getRemainingSeconds(key, 60_000)), 1000);
        return () => clearInterval(t);
    }, [key]);

    const onSubmit = async () => {
        if (error || forgot.isPending || cooldownLeft > 0) return;
        try {
            await forgot.mutateAsync({
                usernameOrEmail: usernameOrEmail.trim(),
                captchaToken: captchaToken.trim() || undefined,
            });
            markSent(key);
            setCooldownLeft(60);
            toast.info('If an account exists, password reset instructions have been sent.');
            router.replace('/(auth)/login' as any);
        } catch (e: any) {
            toast.error(e?.message ?? 'Please try again later.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', default: undefined })}
            style={{ flex: 1 }}
        >
            <TView style={styles.container}>
                <Stack.Screen options={{ title: 'Forgot password' }} />
                <TText style={styles.title}>Forgot password</TText>

                <RNBaseView style={styles.row}>
                    <RNTextInput
                        style={styles.input}
                        placeholder="Username or email"
                        autoCapitalize="none"
                        value={usernameOrEmail}
                        onChangeText={setUsernameOrEmail}
                        onSubmitEditing={onSubmit}
                        blurOnSubmit
                    />
                    {error ? <TText style={styles.error}>{error}</TText> : null}
                </RNBaseView>

                <RNBaseView style={styles.row}>
                    <RNTextInput
                        style={styles.input}
                        placeholder="CAPTCHA token (optional)"
                        autoCapitalize="none"
                        value={captchaToken}
                        onChangeText={setCaptchaToken}
                        onSubmitEditing={onSubmit}
                        blurOnSubmit
                    />
                </RNBaseView>

                <RNButton
                    title={
                        forgot.isPending
                            ? 'Sending…'
                            : cooldownLeft > 0
                                ? `Send (${cooldownLeft}s)`
                                : 'Send reset link'
                    }
                    onPress={onSubmit}
                    disabled={!!error || forgot.isPending || cooldownLeft > 0}
                />

                <RNBaseView style={{ marginTop: 8 }}>
                    <RNButton
                        title="Back to Sign in"
                        onPress={() => router.replace('/(auth)/login' as any)}
                    />
                </RNBaseView>
            </TView>
        </KeyboardAvoidingView>
    );
}

const styles = RNStyleSheet.create({
    container: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
    row: { marginBottom: 8 },
    input: {
        borderWidth: RNStyleSheet.hairlineWidth,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    error: { color: '#ef4444', marginTop: 4 },
});