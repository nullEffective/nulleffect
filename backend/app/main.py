
import logging
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .void import router as void_router

# Leveled logging so verbosity can be dialed without removing instrumentation.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("nulleffect")

app = FastAPI(title="NullEffect Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(void_router)
logger.info("NullEffect Backend started; mounted The Void at /void")

@app.get("/ping")
def ping():
    return {"response": datetime.now(timezone.utc).isoformat()}
