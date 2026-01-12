import { Request, Response } from 'express';
import { GameModel } from '../models/Game';
import { PlayModel } from '../models/Play';
import { PredictionModel } from '../models/Prediction';
import { PlayStatus, PlayOutcome } from '../types/enums';

/**
 * Player Controller - handles player game screens
 */
export class PlayerController {
  /**
   * Show game selection screen
   */
  static showJoinGame(req: Request, res: Response): void {
    const games = GameModel.findActive();
    res.render('player/join', {
      title: 'Join a Game',
      games,
      user: req.session.user
    });
  }
  
  /**
   * Show play screen for a game
   */
  static showPlayScreen(req: Request, res: Response): void {
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
    console.log(`[Player] Current play for game ${gameId}: ID=${currentPlay?.id}, status=${currentPlay?.status}, outcome=${currentPlay?.actual_outcome}`);
    
    const userId = req.session.user!.id;
    
    let userPrediction;
    let gameBreakerAvailable = false;
    if (currentPlay) {
      userPrediction = PredictionModel.findByPlayAndUser(currentPlay.id, userId);
      console.log(`[Player] User ${userId} prediction: ${userPrediction?.predicted_outcome}, points=${userPrediction?.points_awarded}`);
      // Check if Game Breaker is available (not used in current drive)
      gameBreakerAvailable = !PredictionModel.hasUsedGameBreakerInDrive(gameId, userId, currentPlay.id);
    }
    
    res.render('player/play', {
      title: `${game.name}`,
      game,
      currentPlay,
      userPrediction,
      gameBreakerAvailable,
      playOutcomes: Object.values(PlayOutcome),
      PlayStatus,
      user: req.session.user
    });
  }
  
  /**
   * Submit or update a prediction
   */
  static submitPrediction(req: Request, res: Response): void {
    const gameId = parseInt(req.params.id);
    const playId = parseInt(req.params.playId);
    const { predicted_outcome, game_breaker } = req.body;
    
    if (!predicted_outcome || !Object.values(PlayOutcome).includes(predicted_outcome)) {
      return res.redirect(`/games/${gameId}/play?error=Invalid prediction`);
    }
    
    // Check if play is still open
    const play = PlayModel.findById(playId);
    if (!play || play.status !== PlayStatus.OPEN) {
      return res.redirect(`/games/${gameId}/play?error=Predictions are locked for this play`);
    }
    
    const userId = req.session.user!.id;
    const useGameBreaker = game_breaker === 'on';
    
    // If trying to use Game Breaker, check if it's available
    if (useGameBreaker) {
      const hasUsed = PredictionModel.hasUsedGameBreakerInDrive(gameId, userId, playId);
      if (hasUsed) {
        return res.redirect(`/games/${gameId}/play?error=Game Breaker already used this drive`);
      }
    }
    
    PredictionModel.createOrUpdate(playId, userId, predicted_outcome as PlayOutcome, useGameBreaker);
    
    res.redirect(`/games/${gameId}/play`);
  }
  
  /**
   * Show leaderboard for a game
   */
  static showLeaderboard(req: Request, res: Response): void {
    const gameId = parseInt(req.params.id);
    const game = GameModel.findById(gameId);
    
    if (!game) {
      return res.status(404).render('error', {
        title: 'Game Not Found',
        message: 'The requested game does not exist.',
        user: req.session.user
      });
    }
    
    const leaderboard = PredictionModel.getLeaderboard(gameId);
    const allPlays = PlayModel.findByGameId(gameId);
    
    res.render('player/leaderboard', {
      title: `${game.name} - Leaderboard`,
      game,
      leaderboard,
      allPlays,
      user: req.session.user
    });
  }
  
  /**
   * API endpoint for polling current play status
   */
  static getPlayStatus(req: Request, res: Response): void {
    const gameId = parseInt(req.params.id);
    const currentPlay = PlayModel.getCurrentPlay(gameId);
    const userId = req.session.user!.id;
    
    let userPrediction;
    let gameBreakerAvailable = false;
    if (currentPlay) {
      userPrediction = PredictionModel.findByPlayAndUser(currentPlay.id, userId);
      gameBreakerAvailable = !PredictionModel.hasUsedGameBreakerInDrive(gameId, userId, currentPlay.id);
    }
    
    res.json({
      currentPlay,
      userPrediction,
      gameBreakerAvailable
    });
  }
}
