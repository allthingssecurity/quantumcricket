/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// --- Game Visual Constants ---
export const PITCH_COLOR = '#8c7853'; // Darker, retro brown
export const FIELD_COLOR = '#48bb78';
export const STUMPS_COLOR = '#FFFF00';
export const BALL_FALLBACK_COLOR = '#FF0000';
export const BAT_FALLBACK_COLOR = '#A0522D';
export const BATSMAN_FALLBACK_COLOR = '#ADD8E6';
export const CREASE_COLOR = '#FFFFFF';

// --- Game Element Dimensions ---
export const BALL_RADIUS = 8;
export const BALL_SPRITE_DISPLAY_WIDTH = 16;
export const BALL_SPRITE_DISPLAY_HEIGHT = 16;

export const STUMPS_HEIGHT = 50;
export const STUMPS_WIDTH = 5;
export const NUM_STUMPS = 3;
export const STUMP_GAP = 8;

export const BAT_SPRITE_DISPLAY_WIDTH = 35;
export const BAT_SPRITE_DISPLAY_HEIGHT = 100;
export const BATSMAN_SPRITE_DISPLAY_WIDTH = 70;
export const BATSMAN_SPRITE_DISPLAY_HEIGHT = 90;

export const BAT_VISUAL_OFFSET_X = -5; // Bat offset from batsman center

// Fallback primitive rendering dimensions (if sprites fail to load)
export const FALLBACK_BAT_WIDTH = 20; // Increased from 15 for easier hit detection
export const FALLBACK_BAT_HEIGHT = 60;
export const FALLBACK_BATSMAN_WIDTH = 30;
export const FALLBACK_BATSMAN_HEIGHT = 70;

// --- Canvas Dimensions ---
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

// --- Default Game Parameters ---
export const DEFAULT_TOTAL_BALLS = 12;
export const DEFAULT_MAX_WICKETS = 1;
// export const DEFAULT_BALL_SPEED_Y = 4; // Replaced by MIN/MAX
export const MIN_BALL_SPEED_Y = 3.5;
export const MAX_BALL_SPEED_Y = 7.5; // Reduced from 9.5 to make the game easier

// --- Physics & Effects ---
export const GRAVITY = 0.8;
export const BOUNCE_FACTOR = 0.6;
export const TRAIL_LENGTH = 15;

// --- Fielders ---
export const FIELDER_COLOR = '#1d4ed8';
export const FIELDER_RADIUS = 8;
