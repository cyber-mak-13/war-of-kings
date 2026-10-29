from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum

class PlayerStatus(str, Enum):
    """Enumeration of possible player statuses."""
    ONLINE = "online"
    OFFLINE = "offline"
    IN_GAME = "in_game"

class Player(BaseModel):
    """Represents a player in the system."""
    player_id: str
    username: str
    status: PlayerStatus = PlayerStatus.ONLINE
    score: int = 0

class GameStatus(str, Enum):
    """Enumeration of possible game statuses."""
    WAITING = "waiting"
    STARTED = "started"
    FINISHED = "finished"

class GameState(BaseModel):
    """Represents the state of a specific game session."""
    game_id: str
    players: List[str] = Field(default_factory=list)
    status: GameStatus = GameStatus.WAITING
    current_turn: Optional[str] = None
    board: Dict[str, str] = Field(default_factory=dict)
    winner: Optional[str] = None