import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { labels } from '../content';
import { pagePassages, paragraphs } from '../content/format';
import { BookletPage as Page, BookletText, Language, Section } from '../content/types';

export function BookletPage({ page, language, fontSize }: { page: Page; language: Language; fontSize: number }) {
  const ui = labels[language];
  const bodyStyle = { fontSize, lineHeight: Math.round(fontSize * 1.55) };
  const cueStyle = { fontSize: Math.max(16, fontSize - 4) };
  const passages = pagePassages(page);
  const hasDraft = page.titleStatus === 'draft' || passages.some(text => text.status === 'draft');
  const hasPlaceholder = page.titleStatus === 'placeholder' || passages.some(text => text.status === 'placeholder');

  function passage(text: BookletText, textStyle?: StyleProp<TextStyle>) {
    return (
      <View style={styles.passage}>
        {paragraphs(text.text).map((paragraph, index) => (
          <Text key={index} selectable style={[styles.body, bodyStyle, textStyle, index > 0 && { marginTop: fontSize * 0.65 }]}>
            {paragraph}
          </Text>
        ))}
      </View>
    );
  }

  function section(section: Section) {
    switch (section.kind) {
      case 'responses':
        return section.turns.map((turn, index) => (
          <View key={index} style={[styles.response, turn.role === 'all' && styles.all]}>
            {turn.cue !== null && <Text style={[styles.speaker, cueStyle]}>{turn.cue ?? ui[turn.role]}:</Text>}
            {passage(turn.text, turn.role === 'all' ? styles.allText : undefined)}
          </View>
        ));
      case 'scripture':
        return (
          <View style={styles.scripture}>
            {section.referencePosition === 'before' && passage(section.reference, [styles.reference, cueStyle])}
            {passage(section.reading, styles.scriptureText)}
            {section.referencePosition !== 'before' && passage(section.reference, [styles.reference, cueStyle])}
          </View>
        );
      case 'hymn':
        return passage(section.text, styles.song);
      case 'pause':
        return passage(section.text, [styles.pause, cueStyle]);
      case 'reflection':
        return passage(section.text, styles.reflectionText);
      default:
        return passage(section.text);
    }
  }

  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>
        {page.station ? `${ui.station} ${page.numeral}` : page.id === 'opening' ? ui.opening : ui.closing}
      </Text>
      <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={[styles.title, { fontSize: fontSize + 10, lineHeight: Math.round((fontSize + 10) * 1.3) }]}>
        {page.title}
      </Text>
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
      {hasDraft && <Text style={styles.notice}>{ui.draft}</Text>}
      {hasPlaceholder && (
        <View style={styles.draftNotice}>
          <Text style={styles.placeholder}>{ui.placeholder}</Text>
          <Text style={styles.notice}>{ui.notice}</Text>
        </View>
      )}
      {page.sections.map((item, index) => (
        <View key={index} style={[styles.section, item.kind === 'hymn' && styles.hymn]}>
          {item.heading !== null && (item.heading !== undefined || item.kind !== 'responses') && (
            <Text accessibilityRole="header" style={[styles.sectionTitle, { fontSize: Math.max(18, fontSize) }]}>
              {item.heading ?? ui[item.kind as Exclude<Section['kind'], 'responses'>]}
            </Text>
          )}
          {item.note && passage(item.note, [styles.pause, cueStyle])}
          {section(item)}
        </View>
      ))}
      <Text style={styles.endMark} accessibilityElementsHidden importantForAccessibility="no">· · ·</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 600, minWidth: 0, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 30, paddingBottom: 44 },
  eyebrow: { color: '#7c2f36', fontSize: 14, fontWeight: '700', textAlign: 'center', letterSpacing: 1 },
  title: { color: '#302a25', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center', marginTop: 12, flexShrink: 1 },
  rule: { width: 48, height: 2, backgroundColor: '#7c2f36', alignSelf: 'center', marginVertical: 24 },
  body: { color: '#302a25', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', flexShrink: 1 },
  section: { marginTop: 26, minWidth: 0 },
  sectionTitle: { color: '#7c2f36', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: '600', marginBottom: 14 },
  passage: { gap: 6 },
  placeholder: { color: '#725e50', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginTop: 4 },
  response: { paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#cbbfb0', marginBottom: 20 },
  all: { borderLeftColor: '#7c2f36' },
  allText: { fontWeight: '600' },
  speaker: { color: '#7c2f36', fontWeight: '700', marginBottom: 6 },
  scripture: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#d7cbbd', paddingVertical: 18, gap: 12 },
  scriptureText: { fontWeight: '600' },
  reflectionText: { fontStyle: 'italic' },
  reference: { color: '#625247', fontStyle: 'italic', textAlign: 'right' },
  hymn: { borderTopWidth: 1, borderColor: '#d7cbbd', paddingTop: 24 },
  song: { fontStyle: 'italic' },
  pause: { color: '#625247', fontStyle: 'italic' },
  artPlaceholder: { borderWidth: 1, borderColor: '#d7cbbd', padding: 14, marginBottom: 18 },
  artText: { color: '#725e50', fontSize: 15, textAlign: 'center' },
  image: { width: '100%', height: 180, marginBottom: 20 },
  notice: { color: '#725e50', fontSize: 14, lineHeight: 21 },
  draftNotice: { gap: 6 },
  endMark: { color: '#7c2f36', textAlign: 'center', marginTop: 36, fontSize: 22 },
});
