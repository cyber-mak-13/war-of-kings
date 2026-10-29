from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from src.core.engine import GameEngine
from src.models.game_state import GameState, Player

router = APIRouter()
engine = GameEngine()

class CreatePlayerRequest(BaseModel):
    """Schema for creating a new player."""
    player_id: str
    username: str

class JoinGameRequest(BaseModel):
    """Schema for joining an existing game."""
    player_id: str

class MoveRequest(BaseModel):
    """Schema for making a game move."""
    player_id: str
    position: str

def get_engine() -> GameEngine:
    """Dependency injector for the current instance of the GameEngine."""
    return engine

@router.post("/players", response_model=Player)
def create_player(request: CreatePlayerRequest, game_engine: GameEngine = Depends(get_engine)):
    """Creates or retrieves a player."""
    return game_engine.create_player(request.player_id, request.username)

@router.post("/games", response_model=GameState)
def create_game(creator_player_id: str, game_engine: GameEngine = Depends(get_engine)):
    """Creates a new game instance."""
    return game_engine.create_game(creator_player_id)

@router.get("/games/{game_id}", response_model=GameState)
def get_game(game_id: str, game_engine: GameEngine = Depends(get_engine)):
    """Retrieves the current state of a game."""
    game = game_engine.games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.post("/games/{game_id}/join", response_model=bool)
def join_game(game_id: str, request: JoinGameRequest, game_engine: GameEngine = Depends(get_engine)):
    """Allows a player to join a pending game."""
    success = game_engine.join_game(game_id, request.player_id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot join game")
    return True

@router.post("/games/{game_id}/move", response_model=bool)
def make_move(game_id: str, request: MoveRequest, game_engine: GameEngine = Depends(get_engine)):
    """Processes a player's move."""
    success = game_engine.make_move(game_id, request.player_id, request.position)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid move")
    return True