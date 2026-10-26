import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { AppBadge, Button, Card, Chip, SectionTitle } from '@/components/ui';
import { APPS, getApp } from '@/lib/apps';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

const OUTCOME: Record<string, { label: string; color: string }> = {
  done: { label: 'Got it done', color: colors.green },
  partly: { label: 'Partly', color: colors.amber },
  distracted: { label: 'Got distracted', color: colors.red },
  ended: { label: 'Ended early', color: colors.red },
};

export default function Home() {
  const { ready, prefs, usedTodaySec, sessions, cooldownLeftMin } = useStore();
  if (!ready) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <Text style={{ color: colors.muted, fontSize: 15, marginBottom: 14 }}>
        Tell the agent what you need, and it opens a cleaned-up version of the app for just that.
      </Text>

      {APPS.map((app) => {
        const rules = prefs.apps[app.id];
        const used = Math.round(usedTodaySec(app.id) / 60);
        const left = rules.dailyLimitMin - used;
        const cooldown = cooldownLeftMin(app.id);
        const blockedWhy = !rules.enabled ? 'Turned off in your rules' : left <= 0 ? 'Daily limit reached' : cooldown > 0 ? `Cooldown: ${cooldown} min` : null;
        return (
          <Card key={app.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppBadge letter={app.letter} color={app.color} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{app.name}</Text>
                <Text style={{ color: colors.muted, marginTop: 2 }}>
                  {used} of {rules.dailyLimitMin} min used today
                </Text>
              </View>
              <Chip label={blockedWhy ? 'Locked' : 'Ask first'} color={blockedWhy ? colors.red : colors.blue} />
            </View>
            {blockedWhy ? (
              <Text style={{ color: colors.muted, marginTop: 10 }}>{blockedWhy}</Text>
            ) : (
              <Button label={`Ask to open ${app.name}`} color={app.color} onPress={() => router.push({ pathname: '/ask/[app]', params: { app: app.id } })} />
            )}
          </Card>
        );
      })}

      <Button label="My rules" kind="ghost" onPress={() => router.push('/rules')} />
      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 8, textAlign: 'center' }}>
        Agent: {prefs.aiServerUrl ? 'free AI on your computer' : 'stand-in rules (no AI server set)'}
      </Text>

      {sessions.length > 0 && <SectionTitle>Recent sessions</SectionTitle>}
      {sessions.slice(0, 6).map((s) => {
        const o = OUTCOME[s.outcome] ?? OUTCOME.ended;
        return (
          <Card key={s.at}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{getApp(s.app).name}</Text>
              <Chip label={o.label} color={o.color} />
            </View>
            <Text style={{ color: colors.muted, marginTop: 6 }} numberOfLines={2}>
              "{s.goal}" · {Math.round(s.usedSec / 60)} of {s.grantedMin} min
              {s.offTask ? ` · off task ${s.offTask}×` : ''}
            </Text>
          </Card>
        );
      })}
    </ScrollView>
  );
}
