"""
=============================================================
 EXERCISE 1: REQUEST/REPLY PATTERN (Server Side)
=============================================================

 ZeroMQ Pattern: REQ/REP (Request/Reply)
 
 WHY THIS MATTERS FOR IMAGINATION CANVAS:
   In our project, agents need to ASK each other questions
   synchronously. For example:
     - ExecutorAgent asks TesterAgent: "Did this code pass?"
     - PlannerAgent asks KnowledgeGraphAgent: "What do you know about X?"
   
   REQ/REP gives us a simple ask → answer pattern.

 HOW IT WORKS:
   ┌────────────┐        ┌────────────┐
   │  REQ sock  │──msg──▶│  REP sock  │
   │  (client)  │◀──msg──│  (server)  │
   └────────────┘        └────────────┘
   
   - REP socket BINDS to an address (it's the "server")
   - REQ socket CONNECTS to that address (it's the "client")  
   - Communication is strictly: REQ sends → REP receives → REP sends → REQ receives
   
 RUN THIS FILE FIRST (in Terminal 1):
   python3 zeromq_exercises/ex1_reply_server.py
   
 THEN RUN THE CLIENT (in Terminal 2):
   python3 zeromq_exercises/ex1_request_client.py
=============================================================
"""

import zmq
import json
import time

# ─── Step 1: Create a ZeroMQ "context" ───
# Think of context as the "engine" that manages all your sockets.
# You typically create ONE context per process.
context = zmq.Context()

# ─── Step 2: Create a REPLY socket ───
# REP = Reply. This socket WAITS for incoming messages, then sends a reply.
# It's like a function: it receives input and returns output.
socket = context.socket(zmq.REP)

# ─── Step 3: Bind to an address ───
# "tcp://127.0.0.1:5556" means:
#   - tcp:// → Use TCP protocol (reliable, ordered)
#   - 127.0.0.1 → localhost (only this machine)
#   - 5556 → port number (your spec uses 5556 for REQ/REP)
#
# BIND = "I'm the server, I'll sit here and wait"
# (vs CONNECT = "I'm the client, I'll reach out to the server")
socket.bind("tcp://127.0.0.1:5556")

print("🟢 TesterAgent (REP server) is running on tcp://127.0.0.1:5556")
print("   Waiting for requests from other agents...\n")

# ─── Step 4: The main loop ───
# The server runs forever, handling one request at a time.
while True:
    # recv_json() blocks (waits) until a message arrives
    # ZeroMQ handles all the networking magic — buffering, framing, etc.
    request = socket.recv_json()
    
    print(f"📩 Received request from: {request.get('source_agent', 'unknown')}")
    print(f"   Message type: {request.get('msg_type', 'unknown')}")
    print(f"   Payload: {json.dumps(request.get('payload', {}), indent=2)}")
    
    # Simulate some "work" (like running a test)
    time.sleep(0.5)
    
    # ─── Step 5: Send a reply ───
    # IMPORTANT: In REQ/REP, you MUST reply after every receive.
    # If you don't reply, the socket gets "stuck" and won't accept
    # new messages. This is by design — it enforces the request/reply contract.
    reply = {
        "source_agent": "TesterAgent",
        "msg_type": "result",
        "payload": {
            "status": "tests_passed",
            "test_count": 42,
            "coverage": "87%",
            "message": f"All tests passed for block: {request.get('payload', {}).get('block_id', 'unknown')}"
        }
    }
    
    socket.send_json(reply)
    print(f"📤 Sent reply: tests_passed\n")
