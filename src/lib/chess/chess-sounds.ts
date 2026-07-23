let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function tone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = "sine",
  gain = 0.08,
) {
  const ac = ctx();
  if (!ac) return;
  void ac.resume();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + durationMs / 1000);
}

export function playMoveSound() {
  tone(220, 60, "triangle", 0.05);
}

export function playCorrectSound() {
  tone(523, 90, "sine", 0.07);
  window.setTimeout(() => tone(659, 120, "sine", 0.06), 80);
}

export function playHintSound() {
  tone(392, 100, "triangle", 0.05);
}

export function playMilestoneSound() {
  tone(440, 80, "sine", 0.06);
  window.setTimeout(() => tone(554, 80, "sine", 0.06), 70);
  window.setTimeout(() => tone(659, 140, "sine", 0.05), 140);
}
