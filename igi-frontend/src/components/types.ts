export const FSM_STATES = [
    'state1',
    'state1_1',
    'state2',
    'state3',
    'state4',
    'state4_1',
    'state5',
    'state6',
    'state7'
  ] as const;
  
  export type FSMState = typeof FSM_STATES[number];