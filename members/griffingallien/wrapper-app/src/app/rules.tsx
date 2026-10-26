import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { AppBadge, Button, Card, Field, SectionTitle, Stepper, ToggleRow } from '@/components/ui';
import { APPS, AppId } from '@/lib/apps';
import { AppRules, defaultPrefs, Prefs } from '@/lib/prefs';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

// "My rules": each person sets their own restrictions here. Saved on their phone only.
export default function Rules() {
  const { prefs, setPrefs } = useStore();
  const [serverStatus, setServerStatus] = useState<string>('');

  const update = (patch: Partial<Prefs>) => setPrefs({ ...prefs, ...patch });
  const updateApp = (id: AppId, patch: Partial<AppRules>) => update({ apps: { ...prefs.apps, [id]: { ...prefs.apps[id], ...patch } } });

  const testServer = async () => {
    const url = prefs.aiServerUrl.trim().replace(/\/+$/, '');
    if (!url) return setServerStatus('No address set: using the stand-in.');
    setServerStatus('Checking…');
    try {
      const res = await fetch(`${url}/health`);
      const body = await res.json();
      setServerStatus(body.ok ? `Connected (${body.model})` : `Server answered, but it isn't ready: ${body.message}`);
    } catch {
      setServerStatus("Can't reach it. Is the server running, and is your phone on the same Wi-Fi?");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: colors.muted, fontSize: 15 }}>
          These are your rules. The agent follows them when you ask to open an app, and the checker uses them while you're inside.
        </Text>

        {APPS.map((app) => {
          const r = prefs.apps[app.id];
          return (
            <View key={app.id}>
              <SectionTitle>{app.name}</SectionTitle>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <AppBadge letter={app.letter} color={app.color} size={34} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <ToggleRow label={`Allow ${app.name} at all`} value={r.enabled} onChange={(v) => updateApp(app.id, { enabled: v })} />
                  </View>
                </View>
                {r.enabled && (
                  <>
                    <Stepper label="Daily limit" value={r.dailyLimitMin} onChange={(v) => updateApp(app.id, { dailyLimitMin: v })} />
                    <Stepper label="Longest single unlock" value={r.maxSessionMin} min={5} max={120} onChange={(v) => updateApp(app.id, { maxSessionMin: v })} />
                    {app.filters.map((f) => (
                      <ToggleRow
                        key={f.key}
                        label={f.label}
                        help={f.help}
                        value={!!r.filters[f.key]}
                        onChange={(v) => updateApp(app.id, { filters: { ...r.filters, [f.key]: v } })}
                      />
                    ))}
                    {app.note ? <Text style={{ color: colors.muted, fontSize: 13, marginTop: 6 }}>{app.note}</Text> : null}
                  </>
                )}
              </Card>
            </View>
          );
        })}

        <SectionTitle>For the agent</SectionTitle>
        <Card>
          <Field
            label="Good reasons for me"
            help="Comma-separated. The agent unlocks these more easily."
            value={prefs.goodReasons}
            onChangeText={(t) => update({ goodReasons: t })}
            multiline
          />
          <Field
            label="Never good reasons"
            help="Comma-separated. The agent always says no to these."
            value={prefs.neverReasons}
            onChangeText={(t) => update({ neverReasons: t })}
            multiline
          />
          <Field
            label="My rules in my own words"
            help="Anything else, e.g. 'No short videos. Nothing after 10pm. Only cooking on TikTok.' The AI agent reads these; the stand-in uses the switches above."
            value={prefs.personalRules}
            onChangeText={(t) => update({ personalRules: t })}
            multiline
            style={{ minHeight: 90 }}
          />
          <Stepper label="Wait between unlocks" value={prefs.cooldownMin} max={120} onChange={(v) => update({ cooldownMin: v })} />
          <Stepper label="Check what I'm viewing every" value={prefs.checkEverySec} step={15} min={15} max={180} unit="sec" onChange={(v) => update({ checkEverySec: v })} />
        </Card>

        <SectionTitle>AI connection</SectionTitle>
        <Card>
          <Field
            label="AI server address"
            help='Leave empty to use the built-in stand-in. Run "npm run server" on your PC and type the address it shows, e.g. http://192.168.1.20:8787'
            value={prefs.aiServerUrl}
            onChangeText={(t) => update({ aiServerUrl: t })}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Button label="Test connection" kind="ghost" onPress={testServer} />
          {serverStatus ? <Text style={{ color: colors.muted, marginTop: 8 }}>{serverStatus}</Text> : null}
        </Card>

        <Button
          label="Reset to defaults"
          kind="ghost"
          onPress={() =>
            Alert.alert('Reset all rules?', 'This puts every setting back to the default.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: () => setPrefs(defaultPrefs()) },
            ])
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
