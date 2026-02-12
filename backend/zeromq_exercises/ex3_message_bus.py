"""
=============================================================
 EXERCISE 3: FULL MESSAGE BUS (The Real Thing!)
=============================================================

 This combines REQ/REP + PUB/SUB into a single MessageBus class
 that matches the architecture from your project's spec.
 
 This is what actually goes into your backend — it's the
 communication backbone for ALL agent-to-agent messaging.

 ARCHITECTURE (from your spec):
   ┌──────────────────────────────────────────────────┐
   │              MessageBus                           │
   │                                                   │
   │  PUB/SUB (port 5555)  ──▶  Broadcast events     │
   │    - block.created                                │
   │    - agent.status                                 │
   │    - system.heartbeat                             │
   │                                                   │
   │  REQ/REP (port 5556)  ──▶  Synchronous queries  │
   │    - "Did tests pass?"                            │
   │    - "What's the block state?"                    │
   │    - "Parse this intent"                          │
   └──────────────────────────────────────────────────┘

 RUN THIS DEMO:
   python3 zeromq_exercises/ex3_message_bus.py
   
 This file is self-contained — it runs the bus, agents, and 
 demo all in one process using threads (to keep it simple).
=============================================================
"""

import zmq
import json
import threading
import time
import uuid
from datetime import datetime
from typing import Optional


class A2AMessage:
    """
    Agent-to-Agent message format from your spec.
    This is the standardized envelope for ALL inter-agent communication.
    """
    def __init__(
        self,
        source_agent: str,
        dest_agents: list[str],
        msg_type: str,
        payload: dict,
        priority: str = "normal"
    ):
        self.msg_id = str(uuid.uuid4())
        self.timestamp = datetime.utcnow().isoformat()
        self.source_agent = source_agent
        self.dest_agents = dest_agents
        self.msg_type = msg_type  # task_dispatch | query | update | result
        self.payload = payload
        self.priority = priority  # critical | high | normal | low
    
    def to_dict(self) -> dict:
        return {
            "msg_id": self.msg_id,
            "timestamp": self.timestamp,
            "source_agent": self.source_agent,
            "dest_agents": self.dest_agents,
            "msg_type": self.msg_type,
            "payload": self.payload,
            "priority": self.priority
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "A2AMessage":
        msg = cls(
            source_agent=data["source_agent"],
            dest_agents=data["dest_agents"],
            msg_type=data["msg_type"],
            payload=data["payload"],
            priority=data.get("priority", "normal")
        )
        msg.msg_id = data.get("msg_id", msg.msg_id)
        msg.timestamp = data.get("timestamp", msg.timestamp)
        return msg
    
    def __repr__(self):
        return f"<A2AMessage {self.msg_type} from={self.source_agent} to={self.dest_agents}>"


class MessageBus:
    """
    The central message bus for Imagination Canvas.
    Combines PUB/SUB (broadcasts) + REQ/REP (queries) into one system.
    
    This matches the spec from balnce-ai-spec-2.md:
      - PUB/SUB on tcp://127.0.0.1:5555
      - REQ/REP on tcp://127.0.0.1:5556
    """
    
    def __init__(self, pub_port: int = 5555, rep_port: int = 5556):
        self.context = zmq.Context()
        self.pub_port = pub_port
        self.rep_port = rep_port
        
        # ─── PUB socket: for broadcasting events ───
        self.pub_socket = self.context.socket(zmq.PUB)
        self.pub_socket.bind(f"tcp://127.0.0.1:{pub_port}")
        
        # ─── REP socket: for handling synchronous queries ───
        self.rep_socket = self.context.socket(zmq.REP)
        self.rep_socket.bind(f"tcp://127.0.0.1:{rep_port}")
        
        # Track registered handlers for REQ/REP
        self._handlers: dict[str, callable] = {}
        
        # Track stats
        self._published_count = 0
        self._handled_count = 0
        
        print(f"🚌 MessageBus initialized")
        print(f"   PUB/SUB broadcasting on port {pub_port}")
        print(f"   REQ/REP handling on port {rep_port}\n")
    
    def publish(self, topic: str, message: A2AMessage):
        """
        Broadcast a message to all subscribers listening on this topic.
        
        Example topics:
          - "block.created" → A new block was added to the canvas
          - "block.updated" → A block's content changed
          - "agent.status"  → An agent's busy/idle state changed
          - "system.error"  → Something went wrong
        """
        data = {
            "timestamp": datetime.utcnow().isoformat(),
            "topic": topic,
            "message": message.to_dict()
        }
        
        self.pub_socket.send_string(topic, zmq.SNDMORE)
        self.pub_socket.send_json(data)
        self._published_count += 1
    
    def register_handler(self, msg_type: str, handler: callable):
        """
        Register a function to handle a specific message type.
        When a REQ comes in with this msg_type, the handler is called.
        
        Example:
          bus.register_handler("run_tests", tester_agent.handle_test_request)
        """
        self._handlers[msg_type] = handler
        print(f"   📋 Registered handler for msg_type: '{msg_type}'")
    
    def start_reply_loop(self):
        """
        Start listening for REQ/REP messages.
        Runs in a loop — call this in a thread.
        """
        print(f"\n   👂 REP loop started, waiting for queries...\n")
        
        while True:
            try:
                request_data = self.rep_socket.recv_json()
                message = A2AMessage.from_dict(request_data)
                
                print(f"   📩 REQ received: {message}")
                
                # Look up the handler for this message type
                handler = self._handlers.get(message.msg_type)
                
                if handler:
                    # Call the handler and get a reply
                    reply_payload = handler(message)
                    reply = A2AMessage(
                        source_agent="MessageBus",
                        dest_agents=[message.source_agent],
                        msg_type="result",
                        payload=reply_payload
                    )
                else:
                    reply = A2AMessage(
                        source_agent="MessageBus",
                        dest_agents=[message.source_agent],
                        msg_type="error",
                        payload={"error": f"No handler for msg_type: {message.msg_type}"}
                    )
                
                self.rep_socket.send_json(reply.to_dict())
                self._handled_count += 1
                
            except zmq.ZMQError as e:
                print(f"   ❌ ZMQ Error: {e}")
                break
    
    def get_stats(self) -> dict:
        return {
            "published": self._published_count,
            "handled": self._handled_count
        }
    
    def shutdown(self):
        """Clean up sockets and context."""
        self.pub_socket.close()
        self.rep_socket.close()
        self.context.term()
        print("🛑 MessageBus shut down.")


# ─── SIMULATED AGENTS (for demo purposes) ───

def tester_agent_handler(message: A2AMessage) -> dict:
    """Simulates TesterAgent handling a test request."""
    block_id = message.payload.get("block_id", "unknown")
    print(f"   🧪 TesterAgent running tests for block: {block_id}")
    time.sleep(0.3)  # simulate work
    return {
        "status": "tests_passed",
        "block_id": block_id,
        "tests_run": 12,
        "tests_passed": 12,
        "coverage": "91%"
    }


def knowledge_agent_handler(message: A2AMessage) -> dict:
    """Simulates KnowledgeGraphAgent answering a query."""
    query = message.payload.get("query", "")
    print(f"   🧠 KnowledgeAgent searching for: '{query}'")
    time.sleep(0.2)  # simulate work
    return {
        "status": "found",
        "query": query,
        "results": [
            {"concept": "machine learning", "relevance": 0.95},
            {"concept": "neural networks", "relevance": 0.87},
            {"concept": "data preprocessing", "relevance": 0.72}
        ]
    }


def subscriber_thread(topic_filter: str, agent_name: str):
    """A subscriber that listens for broadcast messages."""
    ctx = zmq.Context()
    sub = ctx.socket(zmq.SUB)
    sub.connect("tcp://127.0.0.1:5555")
    sub.setsockopt_string(zmq.SUBSCRIBE, topic_filter)
    
    print(f"   👂 {agent_name} subscribing to [{topic_filter or 'ALL'}]")
    
    while True:
        try:
            topic = sub.recv_string(flags=zmq.NOBLOCK)
            data = sub.recv_json()
            msg = data.get("message", {})
            print(f"   📡 {agent_name} heard [{topic}]: {msg.get('payload', {}).get('status', msg.get('payload', {}))}")
        except zmq.Again:
            time.sleep(0.1)  # No message available, brief pause
        except Exception:
            break


def run_demo():
    """
    Full demo: MessageBus + simulated agents communicating.
    """
    print("=" * 60)
    print("  IMAGINATION CANVAS — ZeroMQ Message Bus Demo")
    print("=" * 60)
    print()
    
    # ─── 1. Create the MessageBus ───
    bus = MessageBus(pub_port=5555, rep_port=5556)
    
    # ─── 2. Register handlers for different message types ───
    bus.register_handler("run_tests", tester_agent_handler)
    bus.register_handler("knowledge_query", knowledge_agent_handler)
    
    # ─── 3. Start the REP loop in a background thread ───
    rep_thread = threading.Thread(target=bus.start_reply_loop, daemon=True)
    rep_thread.start()
    
    # ─── 4. Start subscriber agents in background threads ───
    threading.Thread(
        target=subscriber_thread, args=("block", "PlannerAgent"), daemon=True
    ).start()
    threading.Thread(
        target=subscriber_thread, args=("agent", "CanvasUI"), daemon=True
    ).start()
    
    # Brief pause for connections to establish
    time.sleep(1)
    
    print("\n" + "─" * 60)
    print("  DEMO PART 1: PUB/SUB — Broadcasting Events")
    print("─" * 60 + "\n")
    
    # ─── 5. Publish some events ───
    events = [
        ("block.created", A2AMessage(
            source_agent="IntentParserAgent",
            dest_agents=["ALL"],
            msg_type="update",
            payload={"block_id": "content-001", "block_type": "ContentBlock", "status": "created"}
        )),
        ("agent.status", A2AMessage(
            source_agent="ExecutorAgent",
            dest_agents=["ALL"],
            msg_type="update",
            payload={"status": "busy", "task": "Generating code", "progress": 0.5}
        )),
        ("block.updated", A2AMessage(
            source_agent="ContentBlockAgent",
            dest_agents=["ALL"],
            msg_type="update",
            payload={"block_id": "content-001", "status": "content_generated", "confidence": 0.92}
        )),
    ]
    
    for topic, msg in events:
        bus.publish(topic, msg)
        print(f"   📤 Published [{topic}] from {msg.source_agent}")
        time.sleep(1)
    
    time.sleep(1)  # Let subscribers process
    
    print("\n" + "─" * 60)
    print("  DEMO PART 2: REQ/REP — Synchronous Queries")
    print("─" * 60 + "\n")
    
    # ─── 6. Make synchronous requests ───
    # Create a SEPARATE context for the client (simulating another agent)
    client_ctx = zmq.Context()
    client_socket = client_ctx.socket(zmq.REQ)
    client_socket.connect("tcp://127.0.0.1:5556")
    
    # Request 1: Run tests
    test_request = A2AMessage(
        source_agent="ExecutorAgent",
        dest_agents=["TesterAgent"],
        msg_type="run_tests",
        payload={"block_id": "code-block-789", "language": "python"}
    )
    
    print(f"   📤 ExecutorAgent asking: 'Run tests on code-block-789'")
    client_socket.send_json(test_request.to_dict())
    reply = client_socket.recv_json()
    print(f"   📩 Reply: {reply['payload']}\n")
    
    time.sleep(0.5)
    
    # Request 2: Knowledge query
    knowledge_request = A2AMessage(
        source_agent="PlannerAgent",
        dest_agents=["KnowledgeGraphAgent"],
        msg_type="knowledge_query",
        payload={"query": "artificial intelligence", "limit": 3}
    )
    
    print(f"   📤 PlannerAgent asking: 'What do you know about AI?'")
    client_socket.send_json(knowledge_request.to_dict())
    reply = client_socket.recv_json()
    print(f"   📩 Reply: {json.dumps(reply['payload'], indent=6)}\n")
    
    # ─── Done! ───
    print("=" * 60)
    print("  ✅ DEMO COMPLETE!")
    print("=" * 60)
    
    stats = bus.get_stats()
    print(f"\n  📊 Stats:")
    print(f"     Messages published (PUB/SUB): {stats['published']}")
    print(f"     Requests handled (REQ/REP):   {stats['handled']}")
    
    print(f"\n  💡 WHAT YOU JUST LEARNED:")
    print(f"     1. MessageBus combines PUB/SUB + REQ/REP in one class")
    print(f"     2. PUB/SUB → broadcast events (one-to-many, fire-and-forget)")
    print(f"     3. REQ/REP → synchronous queries (one-to-one, wait for answer)")
    print(f"     4. A2AMessage → standardized envelope for all agent messages")
    print(f"     5. Handlers → register functions to respond to message types")
    
    print(f"\n  🏗️  HOW THIS FITS IN THE PROJECT:")
    print(f"     - This MessageBus class lives in backend/message_bus.py")
    print(f"     - FastAPI startup creates the bus: bus = MessageBus()")
    print(f"     - Each AutoGen agent gets a reference to the bus")
    print(f"     - Block updates → bus.publish('block.updated', ...)")
    print(f"     - Agent queries → REQ socket to bus REP handler")
    print(f"     - Canvas UI gets updates via WebSocket (separate from ZeroMQ)")
    
    print(f"\n  🆚 WHY ZEROMQ OVER RABBITMQ:")
    print(f"     ✅ ZeroMQ: Library (pip install), no server to manage")
    print(f"        RabbitMQ: Full server (brew install rabbitmq, start service)")
    print(f"     ✅ ZeroMQ: Sub-millisecond latency (direct TCP)")
    print(f"        RabbitMQ: 1-5ms (goes through broker process)")
    print(f"     ✅ ZeroMQ: Perfect for local, single-machine agent comms")
    print(f"        RabbitMQ: Shines for distributed, multi-server setups")
    print(f"     ✅ ZeroMQ: Runs in-process, no daemon needed")
    print(f"        RabbitMQ: Requires Erlang VM + running service")
    print()
    
    # Cleanup
    client_socket.close()
    client_ctx.term()
    bus.shutdown()


if __name__ == "__main__":
    run_demo()
