import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { booklets, labels } from '../content';
import { Language, PAGE_IDS, PageId } from '../content/types';
import { BookletPage } from './BookletPage';
import { adjacentPage, createSwipeTracker } from './navigation';
import { FONT_SIZES, Preferences } from './preferences';

type Props = {
  initialPreferences: Preferences;
  savePreferences(preferences: Preferences): Promise<unknown>;
  restoreFailed: boolean;
};

function Action({ text, label = text, onPress, disabled = false, selected = false }: {
  text: string; label?: string; onPress(): void; disabled?: boolean; selected?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled, selected }}
      disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.action, selected && styles.selected, disabled && styles.disabled, pressed && styles.pressed]}>
      <Text style={[styles.actionText, selected && styles.selectedText]}>{text}</Text>
    </Pressable>
  );
}

export function Reader({ initialPreferences, savePreferences, restoreFailed }: Props) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [storageError, setStorageError] = useState<'restore' | 'storage' | null>(restoreFailed ? 'restore' : null);
  const scroll = useRef<ScrollView>(null);
  const pages = booklets[preferences.language];
  const pageIndex = PAGE_IDS.indexOf(preferences.pageId);
  const page = pages[pageIndex];
  const ui = labels[preferences.language];
  const fontIndex = FONT_SIZES.findIndex(size => size === preferences.fontSize);

  function update(patch: Partial<Preferences>) {
    setPreferences(previous => ({ ...previous, ...patch }));
  }

  useEffect(() => {
    // Hydration alone must not rewrite storage or replace a saved page with defaults.
    if (preferences === initialPreferences) return;
    let active = true;
    savePreferences(preferences).then(() => {
      if (active) setStorageError(null);
    }).catch(() => {
      if (active) setStorageError('storage');
    });
    return () => { active = false; };
  }, [preferences, initialPreferences, savePreferences]);

  function goTo(pageId: PageId) {
    if (pageId === preferences.pageId) scroll.current?.scrollTo({ y: 0, animated: false });
    else update({ pageId });
  }

  const panResponder = useMemo(() => {
    const swipe = createSwipeTracker();
    return PanResponder.create({
      onStartShouldSetPanResponderCapture: (_, gesture) => {
        swipe.start(gesture.numberActiveTouches);
        return false;
      },
      onMoveShouldSetPanResponderCapture: (_, gesture) => swipe.move(gesture.dx, gesture.dy, gesture.numberActiveTouches),
      onPanResponderRelease: (_, gesture) => {
        const step = swipe.finish(gesture.dx, gesture.dy);
        if (step) setPreferences(previous => ({ ...previous, pageId: adjacentPage(previous.pageId, step) }));
      },
      onPanResponderStart: (_, gesture) => swipe.addTouch(gesture.numberActiveTouches),
      onPanResponderTerminate: () => swipe.cancel(),
      onPanResponderTerminationRequest: () => true,
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (preferences.pageId === 'opening') return false;
      setPreferences(previous => ({ ...previous, pageId: adjacentPage(previous.pageId, -1) }));
      return true;
    });
    return () => subscription.remove();
  }, [preferences.pageId]);

  function changeLanguage(language: Language) { update({ language }); }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>{ui.app}</Text>
        <View style={styles.controls}>
          <Action text="EN" label="English" selected={preferences.language === 'en'} onPress={() => changeLanguage('en')} />
          <Action text="FIL" label="Filipino" selected={preferences.language === 'fil'} onPress={() => changeLanguage('fil')} />
        </View>
      </View>
      <View style={styles.toolbar}>
        <Action text={`${ui.pages} · ${page.station ? page.numeral : page.id === 'opening' ? ui.opening : ui.closing} ▾`}
          label={ui.select} onPress={() => setSelectorOpen(true)} />
        <View style={styles.controls}>
          <Action text="A−" label={ui.smaller} disabled={fontIndex === 0}
            onPress={() => update({ fontSize: FONT_SIZES[fontIndex - 1] })} />
          <Action text="A+" label={ui.larger} disabled={fontIndex === FONT_SIZES.length - 1}
            onPress={() => update({ fontSize: FONT_SIZES[fontIndex + 1] })} />
        </View>
      </View>
      {storageError && <Text accessibilityRole="alert" style={styles.error}>{ui[storageError]}</Text>}
      <View style={styles.readingArea} {...panResponder.panHandlers}>
        <ScrollView key={`${page.id}:${preferences.language}`} ref={scroll} style={styles.scroll}
          contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator directionalLockEnabled>
          <BookletPage page={page} language={preferences.language} fontSize={preferences.fontSize} />
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <Action text={`‹ ${ui.previous}`} disabled={pageIndex === 0} onPress={() => goTo(adjacentPage(preferences.pageId, -1))} />
        <Text style={styles.pageCount}>{pageIndex + 1} / {PAGE_IDS.length}</Text>
        <Action text={`${ui.next} ›`} disabled={pageIndex === PAGE_IDS.length - 1} onPress={() => goTo(adjacentPage(preferences.pageId, 1))} />
      </View>
      <Modal visible={selectorOpen} animationType="none" onRequestClose={() => setSelectorOpen(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.appTitle}>{ui.select}</Text>
            <Action text={ui.close} onPress={() => setSelectorOpen(false)} />
          </View>
          <ScrollView contentContainerStyle={styles.selector}>
            <Action text={ui.beginning} onPress={() => { goTo('opening'); setSelectorOpen(false); }} />
            {pages.map(item => (
              <Action key={item.id} text={`${item.station ? `${item.numeral}. ` : ''}${item.title}`}
                selected={item.id === preferences.pageId}
                onPress={() => { goTo(item.id); setSelectorOpen(false); }} />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4, gap: 4 },
  appTitle: { color: '#7c2f36', fontSize: 17, fontWeight: '600', flexShrink: 1 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 4, padding: 8, borderBottomWidth: 1, borderBottomColor: '#e1d8cb' },
  action: { minHeight: 48, minWidth: 48, paddingHorizontal: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  actionText: { color: '#7c2f36', fontSize: 16, fontWeight: '600', textAlign: 'center', flexShrink: 1 },
  selected: { backgroundColor: '#7c2f36' },
  selectedText: { color: '#fffaf3' },
  disabled: { opacity: 0.35 },
  pressed: { backgroundColor: '#e5d7cb' },
  readingArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  footer: { borderTopWidth: 1, borderTopColor: '#e1d8cb', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 4 },
  pageCount: { color: '#725e50', fontSize: 14, padding: 4 },
  error: { color: '#7c2f36', paddingHorizontal: 20, paddingVertical: 8, fontSize: 14 },
  modal: { flex: 1, backgroundColor: '#faf7f0' },
  selector: { padding: 16, gap: 8, width: '100%', maxWidth: 640, alignSelf: 'center' },
});
