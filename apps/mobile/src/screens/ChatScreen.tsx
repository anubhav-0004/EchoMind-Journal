import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useMutation, gql } from "@apollo/client";
import { colors, spacing, radius, fontSize } from "../lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const CHAT = gql`
  mutation ChatWithDiary($message: String!, $history: [ChatHistoryInput!]!) {
    chatWithDiary(message: $message, history: $history) {
      role
      content
    }
  }
`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "When do I seem most stressed?",
  "What makes me happy?",
  "What themes come up most?",
  "How has my mood changed?",
];

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I've read all your journal entries. Ask me anything about your mood patterns, specific memories, or recurring themes.",
    },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);

  const [chat, { loading }] = useMutation(CHAT);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");

    try {
      const { data } = await chat({
        variables: {
          message: text,
          history: updated
            .slice(1)
            .map((m) => ({ role: m.role, content: m.content })),
        },
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.chatWithDiary.content,
        },
      ]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble with that. Please try again.",
        },
      ]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.bubble,
        item.role === "user" ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text
        style={[
          styles.bubbleText,
          item.role === "user" ? styles.userText : styles.aiText,
        ]}
      >
        {item.content}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>Chat with Diary</Text>
        <Text style={styles.headerSub}>AI powered by your entries</Text>
      </SafeAreaView>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd()}
        ListFooterComponent={
          loading ? (
            <View style={[styles.bubble, styles.aiBubble]}>
              <ActivityIndicator color={colors.sageLight} size="small" />
            </View>
          ) : null
        }
      />

      {/* Suggestions */}
      {messages.length === 1 && (
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.suggestion}
              onPress={() => sendMessage(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your diary..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!input.trim() || loading) && styles.sendBtnDisabled,
          ]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: "400",
    color: colors.textPrimary,
  },
  headerSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  messageList: { padding: spacing.sm, gap: 10, paddingBottom: spacing.md },
  bubble: {
    maxWidth: "82%",
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: colors.sage,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.bgCard,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: { fontSize: fontSize.md, lineHeight: 22 },
  userText: { color: colors.white },
  aiText: { color: colors.textPrimary },
  suggestions: {
    padding: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  suggestion: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  suggestionText: { fontSize: fontSize.xs, color: colors.textSecondary },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    backgroundColor: colors.sage,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: colors.textMuted },
  sendBtnText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: "500",
  },
});
