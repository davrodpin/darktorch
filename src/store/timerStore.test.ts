import { beforeEach, describe, expect, it } from "vitest";
import { useTimerStore } from "./timerStore";

const DEFAULT_DURATION = 3600;

function resetStore() {
  useTimerStore.setState({
    duration: DEFAULT_DURATION,
    remaining: DEFAULT_DURATION,
    isRunning: false,
    soundEnabled: true,
    isCompleted: false,
    incrementAmount: 300,
    displayMode: "hourglass",
    visibilityMode: "EVERYONE",
  });
}

describe("timerStore", () => {
  beforeEach(() => {
    resetStore();
  });

  it("starts only when remaining > 0", () => {
    useTimerStore.setState({
      remaining: 10,
      isCompleted: true,
      isRunning: false,
    });
    useTimerStore.getState().start();
    expect(useTimerStore.getState().isRunning).toBe(true);
    expect(useTimerStore.getState().isCompleted).toBe(false);

    useTimerStore.getState().pause();
    useTimerStore.setState({ remaining: 0, isCompleted: false });
    useTimerStore.getState().start();
    expect(useTimerStore.getState().isRunning).toBe(false);
  });

  it("pauses and resets correctly", () => {
    useTimerStore.setState({
      isRunning: true,
      remaining: 123,
      isCompleted: true,
    });
    useTimerStore.getState().pause();
    expect(useTimerStore.getState().isRunning).toBe(false);

    useTimerStore.getState().reset();
    expect(useTimerStore.getState().remaining).toBe(DEFAULT_DURATION);
    expect(useTimerStore.getState().isRunning).toBe(false);
    expect(useTimerStore.getState().isCompleted).toBe(false);
  });

  it("setTime clamps between 0 and DEFAULT_DURATION and updates flags", () => {
    useTimerStore.setState({ isRunning: true, isCompleted: false });

    useTimerStore.getState().setTime(100);
    expect(useTimerStore.getState().remaining).toBe(100);
    expect(useTimerStore.getState().isRunning).toBe(true);
    expect(useTimerStore.getState().isCompleted).toBe(false);

    useTimerStore.getState().setTime(-10);
    expect(useTimerStore.getState().remaining).toBe(0);
    expect(useTimerStore.getState().isRunning).toBe(false);
    expect(useTimerStore.getState().isCompleted).toBe(true);

    useTimerStore.getState().setTime(99999);
    expect(useTimerStore.getState().remaining).toBe(DEFAULT_DURATION);
  });

  it("complete sets terminal state", () => {
    useTimerStore.setState({
      isRunning: true,
      remaining: 10,
      isCompleted: false,
    });
    useTimerStore.getState().complete();
    expect(useTimerStore.getState().remaining).toBe(0);
    expect(useTimerStore.getState().isRunning).toBe(false);
    expect(useTimerStore.getState().isCompleted).toBe(true);
  });

  it("updates sound settings and UI modes", () => {
    expect(useTimerStore.getState().soundEnabled).toBe(true);
    useTimerStore.getState().toggleSound();
    expect(useTimerStore.getState().soundEnabled).toBe(false);
    useTimerStore.getState().setSoundEnabled(true);
    expect(useTimerStore.getState().soundEnabled).toBe(true);

    useTimerStore.getState().setIncrementAmount(60);
    expect(useTimerStore.getState().incrementAmount).toBe(60);

    useTimerStore.getState().setDisplayMode("number");
    expect(useTimerStore.getState().displayMode).toBe("number");

    useTimerStore.getState().setVisibilityMode("GM_ONLY");
    expect(useTimerStore.getState().visibilityMode).toBe("GM_ONLY");
  });
});
