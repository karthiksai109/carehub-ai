import json
from typing import Optional, Any
import redis.asyncio as aioredis
from app.core.config import settings


class RedisClient:
    def __init__(self):
        self._redis = None

    async def connect(self):
        self._redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )

    async def disconnect(self):
        if self._redis:
            await self._redis.close()

    async def get(self, key: str) -> Optional[str]:
        if not self._redis:
            return None
        return await self._redis.get(key)

    async def set(self, key: str, value: Any, ttl: int = None) -> None:
        if not self._redis:
            return
        ttl = ttl or settings.REDIS_CACHE_TTL
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        await self._redis.set(key, value, ex=ttl)

    async def delete(self, key: str) -> None:
        if not self._redis:
            return
        await self._redis.delete(key)

    async def publish(self, channel: str, message: dict) -> None:
        if not self._redis:
            return
        await self._redis.publish(channel, json.dumps(message))

    async def subscribe(self, channel: str):
        if not self._redis:
            return
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(channel)
        return pubsub

    async def get_json(self, key: str) -> Optional[dict]:
        data = await self.get(key)
        if data:
            return json.loads(data)
        return None

    async def incr(self, key: str) -> int:
        if not self._redis:
            return 0
        return await self._redis.incr(key)


redis_client = RedisClient()
