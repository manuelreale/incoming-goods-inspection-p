import time

class FSMHelpers:
    def __init__(self):
        self._just_entered = True
        self.state_since = time.monotonic()
        self.state = None

    def on_enter(self) -> bool:
        if self._just_entered:
            self._just_entered = False
            return True
        return False

    def elapsed(self) -> float:
        return time.monotonic() - self.state_since

    def transition(self, next_state: str):
        self.state = next_state
        self._just_entered = True
        self.state_since = time.monotonic()