/**
 * 16-Bit Weather Game Bridge
 *
 * Helper script for games to communicate with parent window
 * Handles score submission via postMessage API
 */

(function() {
  'use strict';

  // Check if running in iframe
  const isInIframe = window.self !== window.top;

  /**
   * Send score to parent window
   * @param {Object} data - Score data
   * @param {string} data.gameSlug - Game identifier (e.g., 'snake', 'tetris')
   * @param {number} data.score - Final score
   * @param {number} [data.level] - Level reached (optional)
   * @param {number} [data.timePlayed] - Time played in seconds (optional)
   * @param {Object} [data.metadata] - Additional game-specific data (optional)
   */
  function submitScore(data) {
    if (!isInIframe) {
      console.log('Not in iframe, score not submitted:', data);
      return false;
    }

    if (!data.gameSlug || typeof data.score !== 'number') {
      console.error('Invalid score data. Required: gameSlug (string) and score (number)');
      return false;
    }

    // Send message to parent
    window.parent.postMessage({
      type: 'GAME_SCORE_SUBMIT',
      gameSlug: data.gameSlug,
      score: data.score,
      level: data.level || null,
      timePlayed: data.timePlayed || null,
      metadata: data.metadata || {}
    }, '*');

    console.log('Score submitted to parent:', data);
    return true;
  }

  /**
   * Notify parent that game has started
   * @param {string} gameSlug - Game identifier
   */
  function notifyGameStart(gameSlug) {
    if (!isInIframe) return;

    window.parent.postMessage({
      type: 'GAME_STARTED',
      gameSlug: gameSlug
    }, '*');
  }

  /**
   * Notify parent when game is paused
   * @param {string} gameSlug - Game identifier
   */
  function notifyGamePause(gameSlug) {
    if (!isInIframe) return;

    window.parent.postMessage({
      type: 'GAME_PAUSED',
      gameSlug: gameSlug
    }, '*');
  }

  /**
   * Notify parent when game is resumed
   * @param {string} gameSlug - Game identifier
   */
  function notifyGameResume(gameSlug) {
    if (!isInIframe) return;

    window.parent.postMessage({
      type: 'GAME_RESUMED',
      gameSlug: gameSlug
    }, '*');
  }

  // Expose API to window
  window.GameBridge = {
    submitScore: submitScore,
    notifyGameStart: notifyGameStart,
    notifyGamePause: notifyGamePause,
    notifyGameResume: notifyGameResume,
    isInIframe: isInIframe
  };

  console.log('GameBridge initialized. Use window.GameBridge.submitScore(data) to submit scores.');
})();
