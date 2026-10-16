import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { labels } from '../content';
import { BookletPage as Page, BookletText, Language, Section } from '../content/types';

export function BookletPage({ page, language, fontSize }: { page: Page; language: Language; fontSize: number }) {
  const ui = labels[language];
  const bodyStyle = { fontSize, lineHeight: Math.round(fontSize * 1.55) };

  function passage(text: BookletText) {
    return (
      <View style={styles.passage}>
        {text.status === 'placeholder' && <Text style={styles.placeholder}>{ui.placeholder}</Text>}
        <Text selectable style={[styles.body, bodyStyle]}>{text.text}</Text>
      </View>
    );
  }

  function section(section: Section) {
    switch (section.kind) {
      case 'responses':
        return section.turns.map((turn, index) => (
          <View key={index} style={[styles.response, turn.role === 'all' && styles.all]}>
            <Text style={[styles.sectionTitle, turn.role === 'all' && styles.allLabel]}>{ui[turn.role]}</Text>
            {passage(turn.text)}
          </View>
        ));
      case 'scripture':
        return <>{passage(section.reference)}{passage(section.reading)}</>;
      default:
        return passage(section.text);
    }
  }

  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>
        {page.station ? `${ui.station} ${page.numeral}` : page.id === 'opening' ? ui.opening : ui.closing}
      </Text>
      <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={[styles.title, { fontSize: fontSize + 10 }]}>
        {page.title}
      </Text>
      {page.titleStatus === 'placeholder' && <Text style={styles.placeholder}>{ui.placeholder}</Text>}
      <View style={styles.rule} />
      {page.illustration && (
        page.illustration.status === 'verified' ? (
          <Image source={page.illustration.asset} accessibilityLabel={page.illustration.description} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.artPlaceholder}>
            <Text style={styles.artText}>{page.illustration.description}</Text>
          </View>
        )
      )}
      <Text style={styles.notice}>{ui.notice}</Text>
      {page.sections.map((item, index) => (
        <View key={index} style={styles.section}>
          {item.kind !== 'responses' && <Text accessibilityRole="header" style={styles.sectionTitle}>{ui[item.kind]}</Text>}
          {section(item)}
        </View>
      ))}
      <Text style={styles.endMark} accessibilityElementsHidden importantForAccessibility="no">· · ·</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  eyebrow: { color: '#7c2f36', fontSize: 14, fontWeight: '700', textAlign: 'center', letterSpacing: 1 },
  title: { color: '#302a25', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center', marginTop: 12 },
  rule: { width: 48, height: 2, backgroundColor: '#7c2f36', alignSelf: 'center', marginVertical: 24 },
  body: { color: '#302a25', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  section: { marginTop: 28 },
  sectionTitle: { color: '#7c2f36', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  passage: { gap: 6, marginBottom: 12 },
  placeholder: { color: '#725e50', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginTop: 4 },
  response: { paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: '#cbbfb0', marginBottom: 16 },
  all: { borderLeftColor: '#7c2f36' },
  allLabel: { textDecorationLine: 'underline' },
  artPlaceholder: { borderWidth: 1, borderColor: '#d7cbbd', padding: 20, marginBottom: 20 },
  artText: { color: '#725e50', fontSize: 15, textAlign: 'center' },
  image: { width: '100%', height: 180, marginBottom: 20 },
  notice: { color: '#725e50', fontSize: 14, lineHeight: 21 },
  endMark: { color: '#7c2f36', textAlign: 'center', marginTop: 36, fontSize: 22 },
});
