"""The Void — a full-stack feature where messages have, by design, null effect.

This is the namesake module: you cast a message into the void and it is
*discarded*. Nothing is persisted to disk or any datastore. The only state we
keep is an ephemeral, in-process tally that itself resets to nothing whenever
the process restarts — a null effect on the world, eventually a null effect on
the counter too.

Endpoints (mounted under /void by main.py):
  POST /void        — cast a message into the void; it is consumed, never stored
  GET  /void/stats  — the ephemeral tally of what has been consumed this lifetime

Everything here is reachable programmatically (plain HTTP/JSON), so it can be
smoke-tested with curl without any UI. See the module docstring footer for
copy-paste examples.

Verbose, leveled logging is intentional: every cast logs an INFO line and a
DEBUG line with enough context to reconstruct what happened, while never
logging the message *content* (the whole point is that it leaves no trace).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel, Field

logger = logging.getLogger("nulleffect.void")

router = APIRouter(prefix="/void", tags=["void"])


# --------------------------------------------------------------------------- #
# Ephemeral, in-process state. Deliberately NOT a database: persistence would
# defeat the premise. This tally dies with the process — a null effect.
# --------------------------------------------------------------------------- #
@dataclass
class VoidLedger:
    """Counts what the void has consumed since this process started."""

    voided_count: int = 0
    characters_consumed: int = 0
    since: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def consume(self, message: str) -> None:
        """Record that `message` was swallowed — without keeping the message."""
        self.voided_count += 1
        self.characters_consumed += len(message)


_ledger = VoidLedger()


# --------------------------------------------------------------------------- #
# Request / response schemas
# --------------------------------------------------------------------------- #
class CastRequest(BaseModel):
    message: str = Field(
        default="",
        max_length=10_000,
        description="The message to cast into the void. It will not be stored.",
    )


class CastResponse(BaseModel):
    status: str
    effect: str
    whispered_back: str
    characters_consumed: int
    voided_count: int


class StatsResponse(BaseModel):
    voided_count: int
    characters_consumed: int
    since: str


# --------------------------------------------------------------------------- #
# The void itself
# --------------------------------------------------------------------------- #
def _whisper(message: str) -> str:
    """Return a faint, reversed echo of the message — the only thing that
    momentarily escapes before the void consumes it. Whitespace-only or empty
    casts get the canonical silence."""
    echo = message.strip()
    if not echo:
        return "..."
    # A reversed echo: recognizable, but already coming apart.
    return echo[::-1]


@router.post("", response_model=CastResponse)
@router.post("/", response_model=CastResponse, include_in_schema=False)
def cast_into_the_void(req: CastRequest) -> CastResponse:
    """Consume a message. It is never persisted; only the tally moves."""
    length = len(req.message)

    # INFO: enough to reconstruct WHAT happened, never the content itself.
    logger.info(
        "void.cast received chars=%d (count will become %d)",
        length,
        _ledger.voided_count + 1,
    )

    whispered = _whisper(req.message)
    _ledger.consume(req.message)

    logger.debug(
        "void.cast consumed: voided_count=%d characters_consumed=%d since=%s "
        "whispered_len=%d",
        _ledger.voided_count,
        _ledger.characters_consumed,
        _ledger.since,
        len(whispered),
    )

    return CastResponse(
        status="discarded",
        effect="null",
        whispered_back=whispered,
        characters_consumed=length,
        voided_count=_ledger.voided_count,
    )


@router.get("/stats", response_model=StatsResponse)
def void_stats() -> StatsResponse:
    """Report the ephemeral tally. Resets to nothing on process restart."""
    logger.debug(
        "void.stats served voided_count=%d characters_consumed=%d since=%s",
        _ledger.voided_count,
        _ledger.characters_consumed,
        _ledger.since,
    )
    return StatsResponse(
        voided_count=_ledger.voided_count,
        characters_consumed=_ledger.characters_consumed,
        since=_ledger.since,
    )


# --------------------------------------------------------------------------- #
# Programmatic smoke test (no UI required):
#
#   uvicorn app.main:app --reload --port 8000
#   curl -s -X POST localhost:8000/void \
#        -H 'content-type: application/json' \
#        -d '{"message":"this will have no effect"}' | jq
#   curl -s localhost:8000/void/stats | jq
# --------------------------------------------------------------------------- #
