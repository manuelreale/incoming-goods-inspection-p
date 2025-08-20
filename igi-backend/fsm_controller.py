from esp_serial import ESPSerial
from gcode_serial import GCodeSerial
from fsm_helpers import FSMHelpers
import asyncio

class FSMController(FSMHelpers):
    def __init__(self, esp: ESPSerial):
        super().__init__() # initialize FSMHelpers (entry flags + timer helpers)
        self.esp = esp
        self.tag1 = None
        self.tag2 = None
        self.tag3 = None
        self.latestTag = None
        self.transition('state1')  # Initial state (sets entry flag & timer)

    def resetValues(self):
        self.tag1 = None
        self.tag2 = None
        self.tag3 = None
        self.latestTag = None

    def get_state_data(self):
        return {
            "state": self.state,
            "tag": self.latestTag,
        }

    # _____________ States ______________ #

    def state1(self):
        if self.on_enter(): print("Entered state1 - waiting for tag1")

        tag = self.esp.readRFID("TAG1")
        if tag!="empty" and tag!=None:
            self.tag1 = tag
            self.latestTag = tag
            # send command to the conveyor belt to move
            self.transition('state1_1')  # Manually transition
    
    def state1_1(self):
        if self.on_enter(): print("Entered state1_1 - showing good loading info")   # State to show incoming good detected

        if self.elapsed() >= 5.0:   
            self.transition('state2')   

    def state2(self):
        if self.on_enter(): print("Entered state2 - moving conveyor and reading tag2")
        # send command to the conveyor belt to move to the right

        tag = self.esp.readRFID("TAG2")
        if tag!="empty" and tag!=None:
            self.tag2 = tag
            self.latestTag = tag
            self.transition('state3')

    def state3(self):
        if self.on_enter(): print("Entered state3 - send command to move last bit")

        # send command to the conveyor belt to move a little bit more
        if self.elapsed() >= 2.0:   # delay to reach center
            self.transition('state4')   

    def state4(self):
        if self.on_enter(): print("Entered state4 - send spin command and wait for scanning end")

        # send command start spinning camera
        if self.elapsed() >= 5.0:   # delay until end of spinning the camera
            self.transition('state4_1')  

    def state4_1(self):
        if self.on_enter(): print("Entered state4_1 - Scan completed animations wait for it to end")

        # send command start spinning camera
        if self.elapsed() >= 22.0:   # delay until end of spinning the camera
            self.transition('state5')  

    def state5(self):
        if self.on_enter(): print("Entered state5 - moving to the end of the belt reading tag3")
        # send command to the conveyor belt to move until the end
        tag = self.esp.readRFID("TAG3")
        if tag!="empty" and tag!=None:
            self.tag3 = tag
            self.latestTag = tag
            self.transition('state6')         

    def state6(self):
        if self.on_enter(): print("Entered state6 - waiting for object to be picked up")

        tag = self.esp.readRFID("TAG3")
        if tag=="empty":
            self.transition('state7')

    def state7(self):
        if self.on_enter(): print("Entered state7 - object picked up waiting for reset")
        
        if self.elapsed() >= 5.0:   # Either wait 15s
            self.resetValues()            
            self.transition('state1')
            return

        tag = self.esp.readRFID("TAG1") # Or detect new object
        if tag!="empty" and tag!=None:
            self.resetValues()
            self.transition('state1')
            return
        pass  

# Shared instance
# Shared instances
gcode = GCodeSerial()
gcode.connect()
gcode.flush_until_idle()
esp = ESPSerial()
controller = FSMController(esp)
controller.gcode = gcode

async def run_state_machine_loop():
    while True:
        state_fn = getattr(controller, controller.state, None)
        if callable(state_fn):
            state_fn()
        await asyncio.sleep(0.3)