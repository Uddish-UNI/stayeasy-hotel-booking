import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPasswordRules } from '../utils/authRules';

export default function AuthInput({ icon, error, secure, ...props }) {
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        <Ionicons name={icon} size={20} color="#64748B" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholderTextColor="#94A3B8"
          secureTextEntry={hidden}
          {...props}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748B" />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

// Shows the 3 password rules turning green as the user types.
export function PasswordChecklist({ password }) {
  const rules = getPasswordRules(password);
  return (
    <View style={styles.checklist}>
      {rules.map((rule) => (
        <View key={rule.label} style={styles.checkRow}>
          <Ionicons
            name={rule.passed ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={rule.passed ? '#16A34A' : '#94A3B8'}
          />
          <Text style={[styles.checkText, rule.passed && styles.checkTextPassed]}>{rule.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  fieldError: { borderColor: '#DC2626' },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#0F172A' },
  error: { color: '#DC2626', fontSize: 12, marginTop: 4, marginLeft: 4 },
  checklist: { marginBottom: 14, marginLeft: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  checkText: { marginLeft: 6, fontSize: 12, color: '#64748B' },
  checkTextPassed: { color: '#16A34A' },
});