"""
=============================================================
 EXERCISE 2: PUBLISH/SUBSCRIBE PATTERN (Publisher)
=============================================================

 ZeroMQ Pattern: PUB/SUB (Publish/Subscribe)
 
 WHY THIS MATTERS FOR IMAGINATION CANVAS:
   When an agent finishes work on a block, ALL other agents
   might need to know about it. For example:
     - ExecutorAgent finishes coding → PlannerAgent updates plan
     - IntentParserAgent creates new blocks → ALL BlockAgents activate
     - Any agent's status changes → Canvas UI updates in real-time
   
   PUB/SUB lets one agent BROADCAST to many listeners at once.
   Listeners can FILTER by topic — they only get messages they care about.

 HOW IT WORKS:
                              ┌────────────┐
                         ┌───▶│  SUB sock  │ (subscribes to "block.*")
   ┌────────────┐        │    └────────────┘
   │  PUB sock  │──msg──▶│    ┌────────────┐
   │ (publisher)│        ├───▶│  SUB sock  │ (subscribes to "agent.*")
   └────────────┘        │    └────────────┘
                         │    ┌────────────┐
                         └───▶│  SUB sock  │ (subscribes to "" = ALL)
                              └────────────┘
   
   - PUB sends to ALL subscribers
   - SUB can FILTER by topic prefix (e.g., only "block." messages)

 RUN THIS FILE FIRST (Terminal 1):
   python3 zeromq_exercises/ex2_publisher.py
   
 THEN RUN ONE OR MORE SUBSCRIBERS (Terminal 2, 3, etc.):
   python3 zeromq_exercises/ex2_subscriber.py
=============================================================
"""

import zmq
import json
import time
from datetime import datetime

# ─── Setup ───
context = zmq.Context()
socket = context.socket(zmq.PUB)

# Your spec uses port 5555 for PUB/SUB
socket.bind("tcp://127.0.0.1:5555")

print("🟢 Message Bus (PUB) broadcasting on tcp://127.0.0.1:5555")
print("   Simulating agent activity...\n")

# ─── IMPORTANT: The "slow joiner" problem ───
# ZeroMQ PUB/SUB has a quirk: if you send messages immediately after
# binding, subscribers might miss the first few messages because the
# TCP connection isn't fully established yet.
# 
# In production, you'd use a synchronization mechanism.
# For now, we just wait a second.
time.sleep(1)

# ─── Simulate various agent events ───
# Each message has a TOPIC prefix. Subscribers filter on this.
events = [
    {
        "topic": "block.created",
        "payload": {
            "source_agent": "IntentParserAgent",
            "block_id": "content-block-001",
            "block_type": "ContentBlock",
            "title": "Market Research Report",
            "status": "created"
        }
    },
    {
        "topic": "agent.status",
        "payload": {
            "source_agent": "ExecutorAgent",
            "status": "busy",
            "current_task": "Generating Python code for market analysis",
            "progress": 0.45
        }
    },
    {
        "topic": "block.updated",
        "payload": {
            "source_agent": "ContentBlockAgent",
            "block_id": "content-block-001",
            "changes": "Added executive summary section",
            "confidence": 0.92
        }
    },
    {
        "topic": "agent.status",
        "payload": {
            "source_agent": "ExecutorAgent",
            "status": "complete",
            "current_task": "Code generation finished",
            "progress": 1.0
        }
    },
    {
        "topic": "block.created",
        "payload": {
            "source_agent": "WorkflowCoordinatorAgent",
            "block_id": "code-block-002",
            "block_type": "CodeBlock",
            "title": "Financial Projections Calculator",
            "status": "created"
        }
    },
    {
        "topic": "system.heartbeat",
        "payload": {
            "active_agents": 4,
            "active_blocks": 3,
            "memory_usage_mb": 256
        }
    },
]

# ─── Broadcast events with a topic prefix ───
for event in events:
    topic = event["topic"]
    message = {
        "timestamp": datetime.utcnow().isoformat(),
        "topic": topic,
        "payload": event["payload"]
    }
    
    # ─── KEY CONCEPT: Topic-based routing ───
    # We send the topic as the FIRST frame, then the data as the SECOND frame.
    # Subscribers filter based on the topic prefix.
    # zmq.SNDMORE tells ZeroMQ "there's another frame coming after this one"
    socket.send_string(topic, zmq.SNDMORE)
    socket.send_json(message)
    
    print(f"📡 Published [{topic}]: {event['payload'].get('source_agent', 'system')}")
    time.sleep(1.5)  # Pause so you can see messages arriving in the subscriber

print("\n✅ All events published!")
print("   Check your subscriber terminal(s) to see which messages they received.")
print("\n💡 TRY THIS: Run multiple subscribers with different topic filters!")
