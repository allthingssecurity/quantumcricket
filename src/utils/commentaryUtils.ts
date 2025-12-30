/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { GameContextForCommentary } from '../types';
import { DEFAULT_MAX_WICKETS } from '../constants';

export async function createPromptForLiveCommentary(context: GameContextForCommentary): Promise<string> {
    const {
        event,
        score = 0,
        wickets = 0,
        ballsBowled = 0,
        totalBalls = 12,
        targetScore = 0,
        currentLevelTitle,
        conceptTriggered
    } = context;

    let eventDescription = "";
    const runsNeeded = Math.max(0, targetScore - score);
    const ballsRemaining = totalBalls - ballsBowled;
    const wicketsRemaining = DEFAULT_MAX_WICKETS - wickets; // Note: maxWickets is dynamic now, but logic holds

    // Build a factual description of the event
    switch (event) {
        case "gameStart":
            eventDescription = `Game Starting.`;
            break;
        case "levelStart":
            eventDescription = `Starting Level: ${currentLevelTitle}. Target: ${targetScore}.`;
            break;
        case "hitSix":
            eventDescription = "Event: SIX runs scored.";
            break;
        case "hitFour":
            eventDescription = "Event: FOUR runs scored.";
            break;
        case "hitThree":
            eventDescription = "Event: THREE runs scored.";
            break;
        case "hitTwo":
            eventDescription = "Event: TWO runs scored.";
            break;
        case "hitOne":
            eventDescription = "Event: ONE run scored.";
            break;
        case "hitDotContact":
            eventDescription = "Event: Dot ball. Batsman made contact, but no run.";
            break;
        case "wicketBowled":
            eventDescription = "Event: WICKET! The batsman is bowled.";
            break;
        case "missedHit":
            eventDescription = "Event: Dot ball. Batsman swung and missed.";
            break;
        case "dotBallKeeper":
            eventDescription = "Event: Dot ball. Ball went to the keeper, no hit.";
            break;
        case "gameWon":
            eventDescription = "Event: VICTORY! The batsman has completed the entire architectural vision!";
            break;
        case "levelWon":
             eventDescription = `Event: Level Complete! Moving to next section.`;
             break;
        case "gameOverWickets":
            eventDescription = "Event: GAME OVER. The batsman is out.";
            break;
        case "gameOverBalls":
            eventDescription = "Event: GAME OVER. Ran out of balls.";
            break;
        default:
            eventDescription = `An interesting moment in the game.`;
            break;
    }

    let overallSituation = "";
    
    // Add concept flavor if available
    if (conceptTriggered) {
        overallSituation += ` Concept Unlocked: "${conceptTriggered}".`;
    }

    if (currentLevelTitle) {
        overallSituation += ` Current Section: ${currentLevelTitle}.`;
    }

    // Add crucial match context for non-terminal events
    if (event !== "gameStart" && event !== "gameWon" && event !== "gameOverWickets" && event !== "gameOverBalls" && event !== "levelWon") {
        if (runsNeeded > 0) {
            overallSituation += ` Need ${runsNeeded} runs from ${ballsRemaining} balls.`;
        } else if (targetScore > 0 && score >= targetScore) {
            overallSituation += " Target reached!";
        }
    }

    // The final prompt for the model
    const finalPrompt = `${eventDescription} ${overallSituation}`.trim();
    
    console.log("Generated prompt for Live API:", finalPrompt);
    return finalPrompt;
}