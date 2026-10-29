import uuid
from typing import Dict, List, Optional
from src.models.game_state import GameState, GameStatus, Player

class GameEngine:
    """Handles core game logic, state management, and player interactions."""

    def __init__(self):
        self.games: Dict[str, GameState] = {}
        self.players: Dict[str, Player] = {}

    def create_player(self, player_id: str, username: str) -> Player:
        """Creates a new player or updates an existing one."""
        if player_id in self.players:
            return self.players[player_id]
        
        player = Player(player_id=player_id, username=username)
        self.players[player_id] = player
        return player

    def create_game(self, creator_player_id: str) -> GameState:
        """Creates a new game session."""
        game_id = str(uuid.uuid4())
        game_state = GameState(
            game_id=game_id,
            players=[creator_player_id],
            status=GameStatus.WAITING
        )
        self.games[game_id] = game_state
        return game_state

    def join_game(self, game_id: str, player_id: str) -> bool:
        """Allows a player to join a pending game."""
        game = self.games.get(game_id)
        if not game or game.status != GameStatus.WAITING:
            return False
        
        if player_id not in game.players and len(game.players) < 2:
            game.players.append(player_id)
            if len(game.players) == 2:
                game.status = GameStatus.STARTED
                game.current_turn = game.players[0]
            return True
        return False

    def make_move(self, game_id: str, player_id: str, position: str) -> bool:
        """Processes a player's move."""
        game = self.games.get(game_id)
        if not game or game.status != GameStatus.STARTED:
            return False
        
        if game.current_turn != player_id:
            return False
            
        if position in game.board:
            return False

        # Tic-tac-toe logic example
        symbol = "X" if game.players.index(player_id) == 0 else "O"
        game.board[position] = symbol
        
        if self._check_win(game.board, symbol):
            game.status = GameStatus.FINISHED
            game.winner = player_id
        elif len(game.board) == 9:
            game.status = GameStatus.FINISHED
            game.winner = None  # Draw
        else:
            # Switch turn
            current_idx = game.players.index(player_id)
            game.current_turn = game.players[(current_idx + 1) % len(game.players)]
            
        return True

    def _check_win(self, board: Dict[str, str], symbol: str) -> bool:
        """Primitive check for winning condition (assumes positions 0-8 for simplicity)."""
        winning_combinations = [
            ("0", "1", "2"), ("3", "4", "5"), ("6", "7", "8"), # rows
            ("0", "3", "6"), ("1", "4", "7"), ("2", "5", "8"), # columns
            ("0", "4", "8"), ("2", "4", "6")              # diagonals
        ]
        
        for pos1, pos2, pos3 in winning_combinations:
            if board.get(pos1) == symbol and board.get(pos2) == symbol and board.get(pos3) == symbol:
                return True
        return False

    def get_game_state(self, game_id: str) -> Optional[GameState]:
        """Retrieves current state of a game."""
        return self.games.get(game_id)