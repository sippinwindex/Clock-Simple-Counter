import React, { useState, useEffect, useRef } from 'react';
import '../../styles/SimpleCounter.css'; // Ensure this path matches your project structure

// --- SVG Icon Component ---
const RetroClockIcon = () => (
    <svg
        className="clock-icon"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="3"
    >
        {/* Bells */}
        <circle cx="25" cy="15" r="10" strokeWidth="2"/>
        <circle cx="75" cy="15" r="10" strokeWidth="2"/>
        <line x1="25" y1="15" x2="40" y2="25" strokeWidth="2"/>
        <line x1="75" y1="15" x2="60" y2="25" strokeWidth="2"/>
        <line x1="50" y1="5" x2="50" y2="15" strokeWidth="4"/> {/* Hammer */}
        {/* Body */}
        <path d="M 15 95 L 20 75 A 40 40 0 1 1 80 75 L 85 95 Z" fill="#1e1e1e" strokeWidth="4"/>
        {/* Inner Face Outline */}
        <circle cx="50" cy="55" r="28" fill="none" strokeWidth="1.5" opacity="0.7" />
        {/* Simple Hands */}
        <line x1="50" y1="55" x2="50" y2="35" strokeWidth="3" strokeLinecap="round"/>
        <line x1="50" y1="55" x2="65" y2="60" strokeWidth="3" strokeLinecap="round"/>
        {/* Feet */}
        <line x1="20" y1="95" x2="30" y2="98" strokeWidth="4" strokeLinecap="round"/>
        <line x1="80" y1="95" x2="70" y2="98" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);

// --- Digit Component ---
const Digit = ({ number }) => {
    const [prevNumber, setPrevNumber] = useState(number);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (number !== prevNumber) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 300);
            setPrevNumber(number);
            return () => clearTimeout(timer);
        }
    }, [number, prevNumber]);

    const displayDigit = number >= 0 && number <= 9 ? number : '?';

    return (
        <div className={`seconds ${animate ? 'digit-change' : ''}`}>
            {displayDigit}
        </div>
    );
};

// --- Vertical Separator Component ---
const VerticalSeparator = () => <div className="vertical-separator"></div>;

// --- Main Counter Component ---
const SimpleCounter = () => {
    // --- State and Refs ---
    const [initialTime, setInitialTime] = useState(60);
    const [currentTime, setCurrentTime] = useState(initialTime); // Initialize based on default mode (countdown)
    const [isRunning, setIsRunning] = useState(false);
    const [alertTime, setAlertTime] = useState(10);
    const [alertTriggered, setAlertTriggered] = useState(false);
    const [showInputs, setShowInputs] = useState(false);
    const [isCountingDown, setIsCountingDown] = useState(true); // true = Down, false = Up
    const intervalRef = useRef(null);

    // --- Effects ---
    // Effect to handle the countdown/count-up timer
    useEffect(() => {
        if (isRunning) { // Only run if isRunning is true
            intervalRef.current = setInterval(() => {
                if (isCountingDown) {
                    // --- Countdown Logic ---
                    setCurrentTime(prevTime => {
                        if (prevTime <= 1) { // Will reach 0 or less on next tick
                            setIsRunning(false); // Stop timer
                            if (intervalRef.current) clearInterval(intervalRef.current); // Ensure interval clears immediately
                            intervalRef.current = null;
                            return 0; // Set final time to 0
                        }
                        return prevTime - 1; // Decrement
                    });
                } else {
                    // --- Count-Up Logic ---
                    setCurrentTime(prevTime => prevTime + 1); // Increment
                    // No auto-stop for count-up based on time value
                }
            }, 1000);
        } else if (!isRunning && intervalRef.current) {
            // Clear interval if stopped explicitly via Stop button or reaching 0
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Cleanup function for unmount or dependency change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, isCountingDown]); // Add isCountingDown dependency

    // Effect to check for the alert time (ONLY FOR COUNTDOWN)
    useEffect(() => {
        if (isCountingDown && // Only alert if counting down
            isRunning &&
            alertTime !== null &&
            currentTime === alertTime &&
            !alertTriggered
        ) {
            window.alert(`🚨 ALARM! Reached target time: ${alertTime} seconds! 🚨`);
            setAlertTriggered(true);
        }

        // Reset alertTriggered flag if conditions no longer met
        if (!isCountingDown || currentTime !== alertTime || !isRunning) {
             setAlertTriggered(false);
        }
    }, [currentTime, alertTime, isRunning, alertTriggered, isCountingDown]); // Add isCountingDown dependency

    // --- Control Handlers ---
    const handleStartResume = () => {
        // Reset alert triggered status for safety
        setAlertTriggered(false);

        if (isCountingDown) {
             // Reset to initial time only if starting fresh from 0 or less
            if (currentTime <= 0 && initialTime > 0) {
                 setCurrentTime(initialTime);
            }
        } else {
            // For count-up, just start running. Reset handles setting to 0.
        }
        setIsRunning(true);
    };

    const handleStop = () => {
        setIsRunning(false);
        // Interval clearing is handled by the main useEffect when isRunning changes
    };

    const handleReset = () => {
        setIsRunning(false);
        setAlertTriggered(false);
        // Interval clearing handled by useEffect
        if (isCountingDown) {
            const validInitialTime = typeof initialTime === 'number' && !isNaN(initialTime) ? initialTime : 0;
            setCurrentTime(validInitialTime);
        } else {
            setCurrentTime(0); // Reset count-up to 0
        }
    };

    // --- Input Handlers ---
    const handleInitialTimeChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 0) {
            setInitialTime(value);
            if (!isRunning && isCountingDown) { // Update only if stopped AND in countdown mode
                setCurrentTime(value);
            }
        } else if (e.target.value === '') {
             setInitialTime('');
             if (!isRunning && isCountingDown) setCurrentTime(0);
        }
    };

    const handleAlertTimeChange = (e) => {
        const value = parseInt(e.target.value, 10);
         if (!isNaN(value) && value >= 0) {
             setAlertTime(value);
         } else if (e.target.value === '') {
            setAlertTime(null);
        }
    };

    // --- Direction Switch Handler ---
    const handleSwitchDirection = () => {
        const nextIsCountingDown = !isCountingDown; // Determine the new direction

        // Stop the timer first
        setIsRunning(false);
        setAlertTriggered(false);
        // Interval clear handled by useEffect when isRunning becomes false

        // Set the new direction
        setIsCountingDown(nextIsCountingDown);

        // Reset time based on the NEW direction
        if (nextIsCountingDown) { // Switching TO Countdown
            const validInitialTime = typeof initialTime === 'number' && !isNaN(initialTime) ? initialTime : 0;
            setCurrentTime(validInitialTime);
        } else { // Switching TO Count-Up
            setCurrentTime(0);
        }
    };


    // --- Calculate Digits for Display ---
    const seconds = Math.max(0, currentTime); // Ensure time doesn't display negative visually
    const onesDigit = Math.floor(seconds % 10);
    const tensDigit = Math.floor((seconds / 10) % 10);
    const hundredsDigit = Math.floor((seconds / 100) % 10);
    const thousandsDigit = Math.floor((seconds / 1000) % 10);

    // Determine if the 'Start' button should be enabled
    const isStartDisabled = isRunning || (isCountingDown && (!initialTime || initialTime <= 0));

    // Determine the label for the start/resume button
    const startButtonLabel = () => {
        if (!isRunning) {
            if (isCountingDown) {
                // In countdown mode, show 'Start' if at initial time or below 0 (and initial > 0)
                return (currentTime === initialTime || (currentTime <= 0 && initialTime > 0)) ? 'Start' : 'Resume';
            } else {
                // In count-up mode, show 'Start' if at 0
                return currentTime === 0 ? 'Start' : 'Resume';
            }
        }
        return 'Resume'; // If already running, it's always 'Resume' logic (though button is disabled)
    };

    // --- Render ---
    return (
        <div className="app-container">
            {/* --- Outer Casing Wrapper --- */}
            <div className="counter-casing">
                {/* The main counter display (inside the casing) */}
                <div className="counter-display">
                    <div className="clock-image">
                        <RetroClockIcon />
                    </div>
                    {/* Digits separated by vertical lines */}
                    <div className="digit-wrapper"> <Digit number={thousandsDigit} /> </div>
                    <VerticalSeparator />
                    <div className="digit-wrapper"> <Digit number={hundredsDigit} /> </div>
                    <VerticalSeparator />
                    <div className="digit-wrapper"> <Digit number={tensDigit} /> </div>
                    <VerticalSeparator />
                    <div className="digit-wrapper"> <Digit number={onesDigit} /> </div>
                </div>
            </div> {/* --- End of counter-casing --- */}

            {/* --- Controls Area --- */}
            <div className="controls-area">
                {/* Setup Toggle */}
                <button onClick={() => setShowInputs(!showInputs)} className="control-button setup-button">
                    {showInputs ? 'Hide Setup' : 'Setup Timer'}
                </button>

                {/* Direction Switch */}
                <button onClick={handleSwitchDirection} className="control-button direction-button">
                     Mode: {isCountingDown ? 'Countdown' : 'Count Up'}
                </button>

                {/* Inputs (Conditionally Shown & Disabled) */}
                {showInputs && (
                    <div className="input-group">
                        <label htmlFor="initialTime" style={{ opacity: isCountingDown ? 1 : 0.5 }}>
                            Start (sec):
                        </label>
                        <input
                            type="number"
                            id="initialTime"
                            value={initialTime === '' ? '' : initialTime}
                            onChange={handleInitialTimeChange}
                            min="0"
                            disabled={isRunning || !isCountingDown} // Disable if running or counting up
                            placeholder="0"
                        />
                        <label htmlFor="alertTime" style={{ opacity: isCountingDown ? 1 : 0.5 }}>
                             Alert (sec):
                        </label>
                        <input
                            type="number"
                            id="alertTime"
                            value={alertTime ?? ''}
                            onChange={handleAlertTimeChange}
                            min="0"
                            disabled={!isCountingDown} // Disable if counting up
                            placeholder="None"
                        />
                    </div>
                )}
            </div>

            {/* --- Action Buttons --- */}
            <div className="action-buttons">
                <button
                    onClick={handleStartResume}
                    disabled={isStartDisabled}
                    className="control-button start-button"
                >
                    {startButtonLabel()}
                </button>
                <button
                    onClick={handleStop}
                    disabled={!isRunning}
                    className="control-button stop-button"
                >
                    Stop
                </button>
                <button onClick={handleReset} className="control-button reset-button">
                    Reset
                </button>
            </div>
        </div>
    );
};

export default SimpleCounter;
