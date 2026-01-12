import { Request, Response } from 'express';
import { GameModel } from '../models/Game';
import { PlayModel } from '../models/Play';
import { PredictionModel } from '../models/Prediction';
import { GameStatus, PlayStatus, PlayOutcome } from '../types/enums';
import { calculateScore } from '../utils/scoring';

/**
 * Admin Controller - handles admin game management
 */
export class AdminController {
  /**
   * Show list of all games
   */
  static listGames(req: Request, res: Response): void {
    const games = GameModel.findAll();
    res.render('admin/games', { 
      title: 'Admin - Games',
      games,
      user: req.session.user
    });
  }
  
  /**
   * Create a new game
   */
  static createGame(req: Request, res: Response): void {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.redirect('/admin/games?error=Game name is required');
    }
    
    const game = GameModel.create(name.trim());
    res.redirect(`/admin/games/${game.id}`);
  }
  
  /**
   * Show game console for managing a specific game
   */
  static showGameConsole(req: Request, res: Response): void {
    const gameId = parseInt(req.params.id);
    const game = GameModel.findById(gameId);
    
    if (!game) {
      return res.status(404).render('error', { 
        title: 'Game Not Found',
        message: 'The requested game does not exist.',
        user: req.session.user
      });
    }
    
    const currentPlay = PlayModel.getCurrentPlay(gameId);
    const allPlays = PlayModel.findByGameId(gameId);
    
    res.render('admin/console', {
      title: `Admin - ${game.name}`,
      game,
      currentPlay,
      allPlays,
      playOutcomes: Object.values(PlayOutcome),
      PlayStatus,
      GameStatus,
      user: req.session.user
    });
  }
  
  /**
   * Create a new play
   */
  static createPlay(req: Request, res: Response): Response | void {
    const gameId = parseInt(req.params.id);
    const { quarter, down } = req.body;
    
    console.log('createPlay called with:', { quarter, down, gameId });
    
    // Validate input
    if (!quarter || !down) {
      console.log('Validation failed: missing quarter or down');
      res.redirect(`/admin/games/${gameId}?error=Quarter and down are required`);
      return;
    }
    
    const game = GameModel.findById(gameId);
    if (!game) {
      return res.status(404).send('Game not found');
    }
    
    // Update game status to live if it's pending
    if (game.status === GameStatus.PENDING) {
      GameModel.updateStatus(gameId, GameStatus.LIVE);
    }
    
    // Create new play
    const sequenceNumber = PlayModel.getNextSequenceNumber(gameId);
    const play = PlayModel.create(
      gameId,
      sequenceNumber,
      parseInt(quarter),
      parseInt(down),
      0,  // Default distance
      ''  // Default yard line
    );
    
    console.log('Play created:', play);
    res.redirect(`/admin/games/${gameId}`);
  }
  
  /**
   * Lock predictions for current play
   */
  static lockPlay(req: Request, res: Response): void {
    const gameId = parseInt(req.params.id);
    const playId = parseInt(req.params.playId);
    
    PlayModel.updateStatus(playId, PlayStatus.LOCKED);
    res.redirect(`/admin/games/${gameId}`);
  }
  
  /**
   * Save actual outcome and score the play
   */
  static scorePlay(req: Request, res: Response): void {
    const gameId = parseInt(req.params.id);
    const playId = parseInt(req.params.playId);
    const { actual_outcome } = req.body;
    
    if (!actual_outcome || !Object.values(PlayOutcome).includes(actual_outcome)) {
      return res.redirect(`/admin/games/${gameId}?error=Invalid outcome selected`);
    }
    
    // Set actual outcome
    PlayModel.setActualOutcome(playId, actual_outcome as PlayOutcome);
    
    // Score all predictions for this play
    const predictions = PredictionModel.findByPlayId(playId);
    predictions.forEach(prediction => {
      const score = calculateScore(prediction.predicted_outcome, actual_outcome as PlayOutcome);
      PredictionModel.updatePoints(prediction.id, score);
    });
    
    res.redirect(`/admin/games/${gameId}`);
  }
  
  /**
   * Update game status
   */
  static updateGameStatus(req: Request, res: Response): void {
    const gameId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || !Object.values(GameStatus).includes(status)) {
      return res.redirect(`/admin/games/${gameId}?error=Invalid status`);
    }
    
    GameModel.updateStatus(gameId, status as GameStatus);
    res.redirect(`/admin/games/${gameId}`);
  }
}
