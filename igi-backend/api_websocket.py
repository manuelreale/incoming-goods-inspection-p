from fastapi import WebSocket
from fsm_controller import controller
import asyncio
from fastapi.websockets import WebSocketDisconnect
from cv.cv_worker import get_latest_boxes
from starlette.websockets import WebSocketState


clients = set()

async def register_client(ws: WebSocket):
    await ws.accept()
    clients.add(ws)
    print("🔌 WebSocket client connected")

async def unregister_client(ws: WebSocket):
    if ws in clients:
        clients.remove(ws)
    # Do not call ws.close() here to avoid double-close errors
    print("❌ WebSocket client disconnected")

async def websocket_endpoint(ws: WebSocket):
    await register_client(ws)
    try:
        while True:
            state_data = controller.get_state_data()
            state_data["boxes"] = get_latest_boxes()

            # Broadcast to all connected clients safely
            for client in list(clients):
                try:
                    # Skip clients that aren't connected anymore
                    if (client.application_state != WebSocketState.CONNECTED or
                        client.client_state != WebSocketState.CONNECTED):
                        await unregister_client(client)
                        continue

                    await client.send_json(state_data)
                except WebSocketDisconnect:
                    await unregister_client(client)
                except RuntimeError:
                    # Happens if a close was already sent; drop client
                    await unregister_client(client)
                except Exception:
                    # Any other error: drop client to keep loop healthy
                    await unregister_client(client)

            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        pass
    finally:
        await unregister_client(ws)