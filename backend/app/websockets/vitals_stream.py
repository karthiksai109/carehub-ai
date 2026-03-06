import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class VitalsConnectionManager:
    """
    WebSocket connection manager for real-time vital signs streaming.
    Supports per-patient subscriptions and broadcast alerts.
    """

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.broadcast_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, patient_id: str = None):
        await websocket.accept()
        if patient_id:
            if patient_id not in self.active_connections:
                self.active_connections[patient_id] = set()
            self.active_connections[patient_id].add(websocket)
        else:
            self.broadcast_connections.add(websocket)
        logger.info(f"WebSocket connected. Patient: {patient_id or 'broadcast'}")

    def disconnect(self, websocket: WebSocket, patient_id: str = None):
        if patient_id and patient_id in self.active_connections:
            self.active_connections[patient_id].discard(websocket)
            if not self.active_connections[patient_id]:
                del self.active_connections[patient_id]
        else:
            self.broadcast_connections.discard(websocket)
        logger.info(f"WebSocket disconnected. Patient: {patient_id or 'broadcast'}")

    async def send_vitals_update(self, patient_id: str, data: dict):
        """Send vital signs update to subscribers of a specific patient."""
        message = json.dumps({
            "type": "vitals_update",
            "patient_id": patient_id,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        })

        # Send to patient-specific subscribers
        connections = self.active_connections.get(patient_id, set())
        disconnected = set()
        for connection in connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.add(connection)

        for conn in disconnected:
            connections.discard(conn)

    async def send_alert(self, alert_data: dict):
        """Broadcast clinical alert to all connected dashboards."""
        message = json.dumps({
            "type": "clinical_alert",
            "data": alert_data,
            "timestamp": datetime.utcnow().isoformat(),
        })

        disconnected = set()
        for connection in self.broadcast_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.add(connection)

        for conn in disconnected:
            self.broadcast_connections.discard(conn)

        # Also send to patient-specific subscribers
        patient_id = alert_data.get("patient_id")
        if patient_id:
            await self.send_vitals_update(patient_id, alert_data)

    async def broadcast_bed_update(self, bed_data: dict):
        """Broadcast bed status changes."""
        message = json.dumps({
            "type": "bed_update",
            "data": bed_data,
            "timestamp": datetime.utcnow().isoformat(),
        })

        disconnected = set()
        for connection in self.broadcast_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.add(connection)

        for conn in disconnected:
            self.broadcast_connections.discard(conn)

    @property
    def total_connections(self) -> int:
        patient_conns = sum(len(conns) for conns in self.active_connections.values())
        return patient_conns + len(self.broadcast_connections)


vitals_manager = VitalsConnectionManager()
