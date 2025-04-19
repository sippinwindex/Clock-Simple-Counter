import React, { useState, useEffect, useRef } from 'react';
import '../../styles/SimpleCounter.css'; // Ensure this path matches your project structure

// SVG Icon Component for the Retro Clock
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

// Component for Individual Digits with Animation
const Digit = ({ number }) => {
    const [prevNumber, setPrevNumber] = useState(number);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (number !== prevNumber) {
            setAnimate(true);
            // Remove animation class after it finishes
            const timer = setTimeout(() => setAnimate(false), 300); // Match CSS animation duration
            setPrevNumber(number);
            return () => clearTimeout(timer);
        }
    }, [number, prevNumber]);

    // Ensure single digit display (0-9)
    const displayDigit = number >= 0 && number <= 9 ? number : '?';

    return (
        <div className={`seconds ${animate ? 'digit-change' : ''}`}>
            {displayDigit}
        </div>
    );
};

// Component for the Vertical Separator Lines
const VerticalSeparator = () => <div className="vertical-separator"></div>;

// Main Counter Component
const SimpleCounter = () => {
    // --- State and Refs ---
    const [initialTime, setInitialTime] = useState(1000); // Default start time (seconds)
    const [currentTime, setCurrentTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const [alertTime, setAlertTime] = useState(10); // Default alert time (seconds)
    const [alertTriggered, setAlertTriggered] = useState(false);
    const [showInputs, setShowInputs] = useState(false); // Toggle visibility of inputs
    const intervalRef = useRef(null); // Ref to store interval ID

    // --- Effects ---
    // Effect to handle the countdown timer
    useEffect(() => {
        if (isRunning && currentTime > 0) {
            intervalRef.current = setInterval(() => {
                setCurrentTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (currentTime === 0 && isRunning) {
            setIsRunning(false); // Stop timer at 0
        }

        // Cleanup function to clear interval
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, currentTime]);

    // Effect to check for the alert time
    useEffect(() => {
        if (
            isRunning &&
            alertTime !== null &&
            currentTime === alertTime &&
            !alertTriggered
        ) {
            // Use window.alert for simplicity
            window.alert(`🚨 ALARM! Reached target time: ${alertTime} seconds! 🚨`);
            setAlertTriggered(true);
            // Optionally stop the timer when alert triggers:
            // setIsRunning(false);
        }
        // Reset alertTriggered flag if time moves away from alert time (or timer stops/resets)
        if (currentTime !== alertTime || !isRunning) {
             setAlertTriggered(false);
        }
    }, [currentTime, alertTime, isRunning, alertTriggered]);


    // --- Control Handlers ---
    const handleStartResume = () => {
        // If starting from 0 or less, but initialTime has a value, reset to initialTime first
        if (currentTime <= 0 && initialTime > 0) {
             setCurrentTime(initialTime);
             setAlertTriggered(false); // Reset alert needed if resetting time
        } else {
            // If simply resuming, only need to reset alert trigger if it had triggered
            if(currentTime === alertTime && alertTriggered){
                 setAlertTriggered(false); // Allow alert again on resume if paused exactly at alert time
            }
        }
        setIsRunning(true);
    };

    const handleStop = () => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setAlertTriggered(false); // Always reset alert status on reset
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        const validInitialTime = typeof initialTime === 'number' && !isNaN(initialTime) ? initialTime : 0;
        setCurrentTime(validInitialTime);
    };

    // --- Input Handlers ---
    const handleInitialTimeChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 0) {
            setInitialTime(value);
            if (!isRunning) { // Update current time only if paused/stopped
                setCurrentTime(value);
            }
        } else if (e.target.value === '') {
             setInitialTime(''); // Allow empty input temporarily
             if (!isRunning) setCurrentTime(0); // Set current time to 0 if empty
        }
    };

    const handleAlertTimeChange = (e) => {
        const value = parseInt(e.target.value, 10);
         if (!isNaN(value) && value >= 0) {
             setAlertTime(value);
         } else if (e.target.value === '') {
            setAlertTime(null); // Handle empty input -> no alert
        }
    };

    // --- Calculate Digits for Display ---
    const seconds = Math.max(0, currentTime);
    const onesDigit = Math.floor(seconds % 10);
    const tensDigit = Math.floor((seconds / 10) % 10);
    const hundredsDigit = Math.floor((seconds / 100) % 10);
    const thousandsDigit = Math.floor((seconds / 1000) % 10);

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


            {/* --- Controls Area and Action Buttons --- */}
            <div className="controls-area">
                <button onClick={() => setShowInputs(!showInputs)} className="control-button setup-button">
                    {showInputs ? 'Hide Setup' : 'Setup Timer'}
                </button>

                {showInputs && (
                    <div className="input-group">
                        <label htmlFor="initialTime">Start (sec):</label>
                        <input
                            type="number"
                            id="initialTime"
                            // Handle potential empty string state for initialTime
                            value={initialTime === '' ? '' : initialTime}
                            onChange={handleInitialTimeChange}
                            min="0"
                            disabled={isRunning} // Disable input while running
                            placeholder="0" // Show placeholder if empty
                        />
                        <label htmlFor="alertTime">Alert (sec):</label>
                        <input
                            type="number"
                            id="alertTime"
                            value={alertTime ?? ''} // Use empty string if null
                            onChange={handleAlertTimeChange}
                            min="0"
                            placeholder="None" // Placeholder for alert time
                        />
                    </div>
                )}
            </div>
            <div className="action-buttons">
                <button
                    onClick={handleStartResume}
                    // Disable if running OR if initialTime is 0 or empty string
                    disabled={isRunning || !initialTime || initialTime <= 0}
                    className="control-button start-button"
                >
                    {(!isRunning && (currentTime === initialTime || currentTime <= 0)) ? 'Start' : 'Resume'}
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