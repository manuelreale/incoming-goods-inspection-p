from typing import Optional
import time
import serial
import serial.tools.list_ports

class GCodeSerial:
    """
    Serial helper dedicated to sending G-code to a controller (e.g., SKR Mini E3 V3.0).
    Typical settings:
    - 115200 baud (default for many Marlin-based boards)
    - Newline line endings ("\n")
    """

    def __init__(self):
        self.ser: Optional[serial.Serial] = None
        self.last_attempt = 0

    def connect(self):
        """Try to connect to a likely SKR/Marlin CDC-ACM device.
        We search for common identifiers that appear in USB descriptions on macOS/Windows/Linux.
        """
        keywords = [
            "STM",            # STM32 Virtual COM Port
            "Marlin",         # Some firmwares expose this
            "BIGTREETECH",    # Vendor string for SKR boards
            "SKR",            # Model hint
            "USB-Serial",     # Generic adapters
            "USB Serial",     # Windows descriptor
            "CDC",            # CDC ACM
        ]
        ports = serial.tools.list_ports.comports()
        for port in ports:
            desc = port.description or ""
            if any(k in desc for k in keywords):
                try:
                    self.ser = serial.Serial(port.device, 115200, timeout=1)
                    # Give firmware a moment after opening; many firmwares reset on open
                    time.sleep(0.2)
                    # Clear any boot noise
                    self.ser.reset_input_buffer()
                    self.ser.reset_output_buffer()
                    print(f"✅ GCode connected on {port.device} ({desc})")
                    return
                except Exception as e:
                    print(f"❌ GCode connect failed on {port.device}: {e}")
        self.ser = None

    def ensure_connection(self):
        if self.ser and self.ser.is_open:
            return
        if time.time() - self.last_attempt > 5:
            print("🔄 Reconnecting GCode port...")
            self.last_attempt = time.time()
            self.connect()

    def _readline(self) -> Optional[str]:
        """Read one line from the controller, decoded and stripped. Returns None on failure."""
        self.ensure_connection()
        if not self.ser:
            return None
        try:
            line = self.ser.readline().decode("utf-8", errors="ignore").strip()
            if line:
                print(f"[GCODE<-] {line}")
            return line
        except Exception as e:
            print(f"⚠️ GCode read error: {e}")
            self.ser = None
            return None

    def send_gcode(self, cmd: str, wait_ok: bool = True, timeout: float = 3.0) -> bool:
        """
        Send a single G-code command. If wait_ok is True, wait until an 'ok' (case-insensitive)
        is received or timeout elapses. Returns True on success, False otherwise.
        """
        self.ensure_connection()
        if not self.ser:
            print("⚠️ No GCode serial connected")
            return False
        try:
            payload = (cmd.strip() + "\n").encode()
            self.ser.write(payload)
            print(f"[GCODE->] {cmd.strip()}")
        except Exception as e:
            print(f"⚠️ GCode write error: {e}")
            self.ser = None
            return False

        if not wait_ok:
            return True

        deadline = time.time() + timeout
        while time.time() < deadline:
            line = self._readline()
            if line is None:
                # transient read failure; keep looping until timeout
                continue
            # Many firmwares echo the command; ignore anything until we see 'ok'
            if line.lower().strip() == "ok":
                return True
            # Some firmwares send informational messages; continue reading
        print("⚠️ Timed out waiting for 'ok' from controller")
        return False

    def flush_until_idle(self, idle_window: float = 0.2, max_wait: float = 2.0):
        """Drain incoming data until it stays quiet for idle_window or max_wait elapses."""
        self.ensure_connection()
        if not self.ser:
            return
        end_by = time.time() + max_wait
        last_rx = time.time()
        while time.time() < end_by:
            line = self._readline()
            if line:
                last_rx = time.time()
            if time.time() - last_rx >= idle_window:
                break