"""
=============================================================
 EXERCISE 2: PUBLISH/SUBSCRIBE PATTERN (Subscriber)
=============================================================

 This listens for messages from the publisher.
 You can FILTER which messages you receive by setting a topic filter.
 
 MAKE SURE ex2_publisher.py IS RUNNING FIRST!

 TRY DIFFERENT FILTERS:
   python3 zeromq_exercises/ex2_subscriber.py              → receives ALL messages
   python3 zeromq_exercises/ex2_subscriber.py block        → only "block.*" messages
   python3 zeromq_exercises/ex2_subscriber.py agent        → only "agent.*" messages
   python3 zeromq_exercises/ex2_subscriber.py block.created → only "block.created" messages

 RUN MULTIPLE SUBSCRIBERS in different terminals to see
 how they all receive the same broadcast!
=============================================================
"""

import zmq
import json
import sys

# ─── Get topic filter from command line ───
# Default: "" (empty string) = subscribe to EVERYTHING
topic_filter = sys.argv[1] if len(sys.argv) > 1 else ""

# ─── Setup ───
context = zmq.Context()
socket = context.socket(zmq.SUB)

# CONNECT to the publisher (not BIND — the publisher binds)
socket.connect("tcp://127.0.0.1:5555")

# ─── KEY CONCEPT: Topic subscription ───
# setsockopt_string(zmq.SUBSCRIBE, "block") means:
#   "Only give me messages where the topic STARTS WITH 'block'"
#
# Examples:
#   "" (empty)        → matches EVERYTHING
#   "block"           → matches "block.created", "block.updated", "block.deleted"
#   "block.created"   → matches ONLY "block.created"
#   "agent"           → matches "agent.status", "agent.error"
#
# This filtering happens INSIDE ZeroMQ — efficient, no wasted bandwidth!
socket.setsockopt_string(zmq.SUBSCRIBE, topic_filter)

filter_display = topic_filter if topic_filter else "ALL TOPICS"
print(f"🔵 Subscriber listening for: [{filter_display}]")
print(f"   Connected to tcp://127.0.0.1:5555")
print(f"   Waiting for messages...\n")

# ─── Receive loop ───
message_count = 0
while True:
    try:
        # Receive the topic (first frame)
        topic = socket.recv_string()
        # Receive the data (second frame)
        data = socket.recv_json()
        
        message_count += 1
        
        payload = data.get("payload", {})
        agent = payload.get("source_agent", "system")
        
        print(f"  📨 #{message_count} [{topic}]")
        print(f"     From: {agent}")
        print(f"     Time: {data.get('timestamp', 'unknown')}")
        
        # Show relevant details based on topic type
        if "block" in topic:
            print(f"     Block: {payload.get('block_id', 'N/A')} ({payload.get('block_type', payload.get('changes', 'N/A'))})")
        elif "agent" in topic:
            print(f"     Status: {payload.get('status', 'N/A')} | Progress: {payload.get('progress', 'N/A')}")
        elif "system" in topic:
            print(f"     Active Agents: {payload.get('active_agents', 'N/A')} | Blocks: {payload.get('active_blocks', 'N/A')}")
        
        print()
        
    except KeyboardInterrupt:
        print(f"\n🛑 Subscriber stopped. Received {message_count} messages.")
        print("\n💡 KEY TAKEAWAYS:")
        print("   1. PUB/SUB is ONE-WAY — publisher sends, subscriber receives (no replies)")
        print("   2. Topic filtering lets agents only listen for relevant events")
        print("   3. Multiple subscribers can listen to the same publisher")
        print("   4. This is how canvas block updates get broadcast to all agents")
        print("\n🔜 Next up: Exercise 3 — the full MessageBus class combining both patterns!")
        break
