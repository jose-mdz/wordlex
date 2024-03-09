"use client";

import { useState, useEffect } from "react";

// Define the hook as a function that accepts a key and an initialValue
function useLocalStorage<T>(key: string, initialValue: T) {
	// Use a state to store the current value, initializing it from localStorage if it exists
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			// Try to get the item from localStorage
			const item = window.localStorage.getItem(key);
			// Parse and return the stored json, or return initialValue if nothing is stored
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			// If error, return initialValue
			console.error(error);
			return initialValue;
		}
	});

	// A function to update the value both in state and localStorage
	const setValue = (value: T | ((val: T) => T)) => {
		try {
			// Allow value to be a function so we have the same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			// Save state
			setStoredValue(valueToStore);
			// Save to local storage
			window.localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			// A more advanced implementation could handle errors, e.g., quota exceeded
			console.error(error);
		}
	};

	// Effect to sync with local storage changes
	useEffect(() => {
		const handleStorageChange = () => {
			try {
				const item = window.localStorage.getItem(key);
				setStoredValue(item ? JSON.parse(item) : initialValue);
			} catch (error) {
				console.error(error);
			}
		};

		// Listen for changes to the localStorage item and update state accordingly
		window.addEventListener("storage", handleStorageChange);

		// Cleanup listener on component unmount
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [key, initialValue]);

	return [storedValue, setValue] as const;
}

export default useLocalStorage;
