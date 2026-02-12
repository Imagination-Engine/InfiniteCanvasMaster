"""
=============================================================
 EXERCISE 1: REQUEST/REPLY PATTERN (Client Side)
=============================================================

 This is the REQUEST side. It sends a message to the REP server
 and waits for a reply.
 
 IMAGINATION CANVAS EXAMPLE:
   This is like the ExecutorAgent asking the TesterAgent:
   "Hey, I just ran this code. Did it pass your tests?"
   
 MAKE SURE ex1_reply_server.py IS RUNNING FIRST!
 
 RUN THIS (in Terminal 2):
   python3 zeromq_exercises/ex1_request_client.py
=============================================================
"""

import zmq
import json

# ─── Step 1: Same context setup ───
context = zmq.Context()

# ─── Step 2: Create a REQUEST socket ───
# REQ = Request. This socket SENDS a message, then WAITS for a reply.
socket = context.socket(zmq.REQ)

# ─── Step 3: CONNECT to the server ───
# Note: CONNECT, not BIND. The client reaches out to the server.
# This can happen BEFORE or AFTER the server binds — ZeroMQ handles it!
socket.connect("tcp://127.0.0.1:5556")

print("🔵 ExecutorAgent (REQ client) connected to TesterAgent")

# ─── Step 4: Build a message following the A2A spec ───
# This matches the message format from your project's documentation!
message = {
    "msg_id": "test-001",
    "source_agent": "ExecutorAgent",
    "dest_agents": ["TesterAgent"],
    "msg_type": "task_dispatch",
    "payload": {
        "block_id": "code-block-abc123",
        "action": "run_tests",
        "code": "def hello(): return 'world'",
        "language": "python"
    },
    "priority": "high"
}

print(f"\n📤 Sending request to TesterAgent...")
print(f"   Block ID: {message['payload']['block_id']}")
print(f"   Action: {message['payload']['action']}")

# ─── Step 5: Send and wait for reply ───
# send_json() serializes the dict to JSON and sends it
socket.send_json(message)

# recv_json() blocks until we get a reply back
# Remember: REQ/REP is synchronous — we MUST wait for the reply
# before we can send another message
reply = socket.recv_json()

print(f"\n📩 Got reply from: {reply['source_agent']}")
print(f"   Status: {reply['payload']['status']}")
print(f"   Tests: {reply['payload']['test_count']}")
print(f"   Coverage: {reply['payload']['coverage']}")
print(f"   Message: {reply['payload']['message']}")

print("\n✅ Exercise 1 complete! You just did agent-to-agent communication!")
print("\n💡 KEY TAKEAWAYS:")
print("   1. REQ/REP is SYNCHRONOUS — client waits for the server's reply")
print("   2. The server MUST reply to every request (or the socket locks up)")
print("   3. This pattern is great for: 'Did this pass?' / 'What do you know?'")
print("   4. ZeroMQ handles all the TCP buffering, framing, reconnection, etc.")
print("\n🔜 Next up: Exercise 2 (PUB/SUB) — broadcasting to multiple agents!")
