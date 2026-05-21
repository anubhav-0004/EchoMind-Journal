import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useMutation, gql } from "@apollo/client";
import { setToken } from "../lib/storage";
import { colors, spacing, radius, fontSize } from "../lib/theme";

const SIGNUP = gql`
  mutation Signup($email: String!, $password: String!, $displayName: String!) {
    signup(email: $email, password: $password, displayName: $displayName) {
      token
      user {
        id
        displayName
      }
    }
  }
`;

export function SignupScreen({ navigation }: any) {
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });

  const [signup, { loading }] = useMutation(SIGNUP, {
    onCompleted: async (data: any) => {
      await setToken(data.signup.token);
      navigation.replace("Main");
    },
    onError: (err: any) => Alert.alert("Signup failed", err.message),
  });

  const handleSignup = () => {
    if (!form.displayName || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    signup({ variables: form });
  };

  const fields = [
    {
      key: "displayName",
      label: "Your name",
      placeholder: "Anubhav Kumar",
      type: "default",
    },
    {
      key: "email",
      label: "Email",
      placeholder: "you@example.com",
      type: "email-address",
    },
    {
      key: "password",
      label: "Password",
      placeholder: "••••••••",
      type: "default",
      secure: true,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoSymbol}>✦</Text>
          </View>
          <Text style={styles.logoText}>EchoMind</Text>
          <Text style={styles.subtitle}>Start your journaling journey</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Create account</Text>

          {fields.map((field) => (
            <View key={field.key} style={styles.field}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={(form as any)[field.key]}
                onChangeText={(val) =>
                  setForm((prev) => ({ ...prev, [field.key]: val }))
                }
                placeholder={field.placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={field.type as any}
                autoCapitalize={field.key === "email" ? "none" : "words"}
                secureTextEntry={field.secure}
                autoCorrect={false}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnText}>Create account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.linkText}>
              Already have an account?{" "}
              <Text style={styles.linkHighlight}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: "center" },
  logoArea: { alignItems: "center", marginBottom: spacing.xl },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  logoSymbol: { fontSize: 24, color: colors.white },
  logoText: {
    fontSize: fontSize.xxl,
    fontWeight: "300",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 },
  form: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: fontSize.xl,
    fontWeight: "400",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  field: { marginBottom: spacing.md },
  label: {
    fontSize: fontSize.xs,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  btn: {
    backgroundColor: colors.sage,
    borderRadius: radius.sm,
    padding: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  btnDisabled: { backgroundColor: colors.textMuted },
  btnText: { color: colors.white, fontSize: fontSize.md, fontWeight: "500" },
  link: { marginTop: spacing.md, alignItems: "center" },
  linkText: { fontSize: fontSize.sm, color: colors.textMuted },
  linkHighlight: { color: colors.sageLight, fontWeight: "500" },
});
