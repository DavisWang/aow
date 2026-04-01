const AUDIO_ENABLED_STORAGE_KEY = "aow.audio.enabled";

export function loadAudioEnabledPreference(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    const storedValue = window.localStorage.getItem(AUDIO_ENABLED_STORAGE_KEY);
    return storedValue === null ? true : storedValue === "true";
  } catch {
    return true;
  }
}

export function saveAudioEnabledPreference(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(AUDIO_ENABLED_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage failures so audio never blocks the game loop.
  }
}
