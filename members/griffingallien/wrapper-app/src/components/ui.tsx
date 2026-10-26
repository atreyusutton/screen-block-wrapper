import { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { colors, radius } from '@/lib/theme';

export function Button({ label, onPress, kind = 'primary', color, disabled }: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost';
  color?: string;
  disabled?: boolean;
}) {
  const bg = kind === 'primary' ? color ?? colors.blue : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, borderColor: kind === 'ghost' ? colors.line : bg, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[s.btnText, { color: kind === 'primary' ? '#0B0F1A' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={s.section}>{children}</Text>;
}

export function Chip({ label, color = colors.blue }: { label: string; color?: string }) {
  return (
    <View style={[s.chip, { borderColor: color }]}>
      <Text style={[s.chipText, { color }]}>{label}</Text>
    </View>
  );
}

export function ToggleRow({ label, help, value, onChange }: { label: string; help?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.row}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={s.rowLabel}>{label}</Text>
        {help ? <Text style={s.help}>{help}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.green, false: colors.line }} />
    </View>
  );
}

export function Stepper({ label, value, onChange, step = 5, min = 0, max = 240, unit = 'min' }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, { flex: 1 }]}>{label}</Text>
      <Pressable style={s.stepBtn} onPress={() => onChange(Math.max(min, value - step))}>
        <Text style={s.stepBtnText}>−</Text>
      </Pressable>
      <Text style={s.stepValue}>
        {value} {unit}
      </Text>
      <Pressable style={s.stepBtn} onPress={() => onChange(Math.min(max, value + step))}>
        <Text style={s.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

export function Field(props: TextInputProps & { label: string; help?: string }) {
  const { label, help, style, ...rest } = props;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.rowLabel}>{label}</Text>
      {help ? <Text style={s.help}>{help}</Text> : null}
      <TextInput placeholderTextColor={colors.muted} style={[s.input, style]} {...rest} />
    </View>
  );
}

export function AppBadge({ letter, color, size = 44 }: { letter: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#0B0F1A', fontWeight: '800', fontSize: size * 0.36 }}>{letter}</Text>
    </View>
  );
}

export const s = StyleSheet.create({
  btn: { borderRadius: radius.pill, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', borderWidth: 1.5, marginTop: 10 },
  btnText: { fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: colors.panel, borderRadius: radius.card, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.line },
  section: { color: colors.muted, fontSize: 13, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 18, marginBottom: 8 },
  chip: { borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  chipText: { fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  help: { color: colors.muted, fontSize: 13, marginTop: 2 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.panel2, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { color: colors.text, fontSize: 20, fontWeight: '700' },
  stepValue: { color: colors.text, fontSize: 15, fontWeight: '700', minWidth: 74, textAlign: 'center' },
  input: { backgroundColor: colors.panel2, color: colors.text, borderRadius: 12, padding: 12, fontSize: 15, marginTop: 8, borderWidth: 1, borderColor: colors.line },
});
