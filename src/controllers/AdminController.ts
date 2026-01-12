import { Request, Response } from 'express';
import { GameModel } from '../models/Game';
import { PlayModel } from '../models/Play';
import { PredictionModel } from '../models/Prediction';
import { UserModel } from '../models/User';
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
      console.error('Invalid outcome:', actual_outcome, 'Valid outcomes:', Object.values(PlayOutcome));
      return res.redirect(`/admin/games/${gameId}?error=Invalid outcome selected`);
    }
    
    console.log(`Scoring play ${playId} with outcome: ${actual_outcome}`);
    
    try {
      // Set actual outcome and mark as SCORED
      const scoreSuccess = PlayModel.setActualOutcome(playId, actual_outcome as PlayOutcome);
      if (!scoreSuccess) {
        console.error(`Failed to update play ${playId} - play may not exist`);
        return res.redirect(`/admin/games/${gameId}?error=Failed to score play`);
      }
      
      // Verify the update worked
      const updatedPlay = PlayModel.findById(playId);
      console.log(`Play ${playId} updated to status: ${updatedPlay?.status}, outcome: ${updatedPlay?.actual_outcome}`);
      
      // Score all predictions for this play
      const predictions = PredictionModel.findByPlayId(playId);
      console.log(`Found ${predictions.length} predictions for play ${playId}`);
      
      predictions.forEach(prediction => {
        const user = UserModel.findById(prediction.user_id);
        if (!user) {
          console.error(`User ${prediction.user_id} not found for prediction ${prediction.id}`);
          return;
        }
        
        const result = calculateScore(
          prediction.predicted_outcome, 
          actual_outcome as PlayOutcome,
          user.streak,
          prediction.game_breaker === 1
        );
        
        PredictionModel.updatePoints(prediction.id, result.score);
        UserModel.updateStreak(prediction.user_id, result.newStreak);
        console.log(`Updated prediction ${prediction.id}: score = ${result.score}, new streak = ${result.newStreak}`);
      });
      
      res.redirect(`/admin/games/${gameId}`);
    } catch (error) {
      console.error('Error scoring play:', error);
      res.redirect(`/admin/games/${gameId}?error=Error scoring play`);
    }
  }
  
  /**
   * Edit a scored play's outcome and recalculate scores
   */
  static editPlay(req: Request, res: Response): void {
    const gameId = parseInt(req.params.id);
    const playId = parseInt(req.params.playId);
    const { actual_outcome } = req.body;
    
    if (!actual_outcome || !Object.values(PlayOutcome).includes(actual_outcome)) {
      return res.redirect(`/admin/games/${gameId}?error=Invalid outcome selected`);
    }
    
    const play = PlayModel.findById(playId);
    if (!play) {
      return res.redirect(`/admin/games/${gameId}?error=Play not found`);
    }
    
    // Only allow editing scored plays
    if (play.status !== PlayStatus.SCORED) {
      return res.redirect(`/admin/games/${gameId}?error=Can only edit scored plays`);
    }
    
    // Update the actual outcome
    PlayModel.setActualOutcome(playId, actual_outcome as PlayOutcome);
    
    // Recalculate scores for all predictions on this play
    const predictions = PredictionModel.findByPlayId(playId);
    predictions.forEach(prediction => {
      const user = UserModel.findById(prediction.user_id);
      if (!user) {
        console.error(`User ${prediction.user_id} not found for prediction ${prediction.id}`);
        return;
      }
      
      const result = calculateScore(
        prediction.predicted_outcome, 
        actual_outcome as PlayOutcome,
        user.streak,
        prediction.game_breaker === 1
      );
      
      PredictionModel.updatePoints(prediction.id, result.score);
      UserModel.updateStreak(prediction.user_id, result.newStreak);
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
