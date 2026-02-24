import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectorOption(BaseModel):
    id: str
    label: str
    enabled: bool
    description: str


class SyncResponse(BaseModel):
    source: str
    institutions: int
    accounts: int
    transactions: int
    synced_at: str


def plaid_enabled() -> bool:
    client_id = os.getenv("PLAID_CLIENT_ID")
    secret = os.getenv("PLAID_SECRET")
    return bool(client_id and secret)


@app.get("/")
async def root():
    return {"message": "SpendTrace local backend"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/connectors", response_model=list[ConnectorOption])
async def connectors():
    plaid_ready = plaid_enabled()
    return [
        ConnectorOption(
            id="DEMO",
            label="Demo Data",
            enabled=True,
            description="Seeded localhost transactions and account graph",
        ),
        ConnectorOption(
            id="PLAID",
            label="Plaid",
            enabled=plaid_ready,
            description=(
                "Local stub mode" if plaid_ready else "Set PLAID_CLIENT_ID + PLAID_SECRET to enable"
            ),
        ),
    ]


@app.post("/sync/{source}", response_model=SyncResponse)
async def sync(source: str):
    source_normalized = source.upper()
    if source_normalized not in {"DEMO", "PLAID"}:
        raise HTTPException(status_code=400, detail="Source must be DEMO or PLAID")

    if source_normalized == "PLAID" and not plaid_enabled():
        raise HTTPException(
            status_code=503,
            detail="Plaid connector is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET.",
        )

    # Local MVP returns deterministic mock counts to keep UI contract stable.
    return SyncResponse(
        source=source_normalized,
        institutions=2,
        accounts=4,
        transactions=128,
        synced_at=datetime.now(timezone.utc).isoformat(),
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
