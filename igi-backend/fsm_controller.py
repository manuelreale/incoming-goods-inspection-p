from turtle import setup
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
    
    def setupGCODE(self):
        #belt setup
        self.gcode.send_gcode("M92 Y1484")          #steps per revolution
        self.gcode.send_gcode("M201 Y2")            #max accel
        self.gcode.send_gcode("M203 Y600")          #max speed
        self.gcode.send_gcode("M205 Y0.01")         #jerk
        #CameraSpin stup
        self.gcode.send_gcode("M92 X3200")          #steps per revolution
        self.gcode.send_gcode("M201 X1")            #max accel 
        self.gcode.send_gcode("M203 X600")          #max speed
        self.gcode.send_gcode("M205 X0.0001")       #jerk

    def firstMovementToCenter(self):
            self.gcode.send_gcode("G91")            #relative positioning
            self.gcode.send_gcode("G1 Y26.5 F300")  #move 26.5 cm forward

    def secondMovementToEnd(self):
            self.gcode.send_gcode("G91")            #relative positioning
            self.gcode.send_gcode("G1 Y26.5 F300")  #move 26.5 cm forward

    def cameraSpin(self):
            self.gcode.send_gcode("G1 X40 F600")    #move 40 revolution forward
            self.gcode.send_gcode("G1 X-40 F600")   #move 40 revolution backwards


    # _____________ States ______________ #

    def state1(self):
        if self.on_enter(): 
            self.setupGCODE()
            print("Entered state1 - waiting for tag1")

        tag = self.esp.readRFID("TAG1")
        if tag!="empty" and tag!=None:
            self.tag1 = tag
            self.latestTag = tag
            self.transition('state1_1')
    
    def state1_1(self):
        if self.on_enter(): print("Entered state1_1 - showing good loading info")   # State to show incoming good detected

        if self.elapsed() >= 5.0:   
            self.transition('state2')   

    def state2(self):
        if self.on_enter(): 
            print("Entered state2 - moving conveyor and reading tag2")
            self.firstMovementToCenter()

        if self.elapsed() >= 7.0:   
            self.transition('state3')  

        # tag = self.esp.readRFID("TAG2")           #Ignoring TAG2 for now
        # if tag!="empty" and tag!=None:
        #     self.tag2 = tag
        #     self.latestTag = tag
        #     self.transition('state3')

    def state3(self):
        if self.on_enter(): print("Entered state3 - Item reached center")

        if self.elapsed() >= 2.0:   # delay to reach center
            self.transition('state4')   

    def state4(self):
        if self.on_enter(): 
            print("Entered state4 - send spin command and wait for scanning end")
            self.cameraSpin()

        if self.elapsed() >= 30.0:   # delay until end of spinning the camera
            self.transition('state4_1')  

    def state4_1(self):
        if self.on_enter(): print("Entered state4_1 - Scan completed animations wait for it to end")

        if self.elapsed() >= 22.0:   # delay until end of spinning the camera
            self.transition('state5')  

    def state5(self):
        if self.on_enter(): 
            print("Entered state5 - moving to the end of the belt reading tag3")
            self.secondMovementToEnd()

        if self.elapsed() >= 7.0:   # delay until end of spinning the camera
            self.transition('state6')  

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