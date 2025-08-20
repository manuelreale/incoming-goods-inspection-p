from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_websocket import websocket_endpoint
from fsm_controller import controller, run_state_machine_loop
from cv.cv_worker import start_cv_loop

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.websocket("/ws")(websocket_endpoint)

@app.on_event("startup")
async def startup_event():
    import asyncio
    start_cv_loop()
    asyncio.create_task(run_state_machine_loop())