#! /usr/bin/env node
import inquirer from "inquirer";
const users = [];
const testResults = [];
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
async function displayWelcomeMessage() {
    console.log('Welcome to the Online Typing Speed Tester CLI!');
    console.log('This system will help you measure your typing speed in Words Per Minute (WPM).');
}
async function signup() {
    const userData = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter your name:' },
        { type: 'input', name: 'email', message: 'Enter your email:' },
        { type: 'password', name: 'password', message: 'Enter your password:' }
    ]);
    const user = { id: generateId(), ...userData };
    users.push(user);
    console.log('Signup successful!');
}
async function login() {
    const { email, password } = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Enter your email:' },
        { type: 'password', name: 'password', message: 'Enter your password:' }
    ]);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        console.log(`Welcome back, ${user.name}!`);
        await userMenu(user);
    }
    else {
        console.log('Invalid email or password. Please try again.');
        await login();
    }
}
async function userMenu(user) {
    const { choice } = await inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'User Menu. Please choose an option:',
        choices: [
            'Take Typing Test',
            'View Test Results',
            'Logout'
        ]
    });
    switch (choice) {
        case 'Take Typing Test':
            await takeTypingTest(user);
            break;
        case 'View Test Results':
            await viewTestResults(user);
            break;
        case 'Logout':
            console.log('Logged out successfully.');
            await mainMenu();
            return;
    }
    await userMenu(user);
}
async function takeTypingTest(user) {
    const difficulties = ['Easy', 'Medium', 'Hard', 'Go Back'];
    const { difficulty } = await inquirer.prompt({
        type: 'list',
        name: 'difficulty',
        message: 'Choose the difficulty level:',
        choices: difficulties
    });
    if (difficulty === 'Go Back') {
        await userMenu(user);
        return;
    }
    const sampleText = getSampleText(difficulty);
    console.log('Typing Test:');
    console.log('Please type the following text as quickly and accurately as possible:');
    console.log(sampleText);
    const { timeLimit } = await inquirer.prompt({
        type: 'number',
        name: 'timeLimit',
        message: 'Enter the time limit for the test in minutes:',
        validate: (input) => input > 0 ? true : 'Please enter a valid number greater than 0.'
    });
    console.log(`You have ${timeLimit} minute(s) to complete the test. Start typing now:`);
    const start = Date.now();
    const { typedText } = await inquirer.prompt({
        type: 'input',
        name: 'typedText',
        message: 'Start typing:'
    });
    const end = Date.now();
    const timeTaken = (end - start) / 60000; // time taken in minutes
    const adjustedTime = Math.min(timeTaken, timeLimit); // adjust time taken to the time limit if exceeded
    const wordsTyped = typedText.split(' ').length;
    const wpm = wordsTyped / adjustedTime;
    const accuracy = calculateAccuracy(sampleText, typedText);
    const result = {
        userId: user.id,
        wpm,
        accuracy,
        testText: sampleText,
        typedText
    };
    testResults.push(result);
    console.log(`Test completed! Your typing speed is ${wpm.toFixed(2)} WPM with ${accuracy.toFixed(2)}% accuracy.`);
}
function calculateAccuracy(testText, typedText) {
    const testWords = testText.split(' ');
    const typedWords = typedText.split(' ');
    let correctWords = 0;
    testWords.forEach((word, index) => {
        if (typedWords[index] === word)
            correctWords++;
    });
    return (correctWords / testWords.length) * 100;
}
async function viewTestResults(user) {
    const userResults = testResults.filter(r => r.userId === user.id);
    if (userResults.length === 0) {
        console.log('No test results found.');
    }
    else {
        console.log('Your Test Results:');
        userResults.forEach(result => {
            console.log(`WPM: ${result.wpm.toFixed(2)}, Accuracy: ${result.accuracy.toFixed(2)}%`);
            console.log(`Typed Text: "${result.typedText}"`);
        });
    }
}
async function mainMenu() {
    const { choice } = await inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'Main Menu. Please choose an option:',
        choices: [
            'Signup',
            'Login',
            'Exit'
        ]
    });
    switch (choice) {
        case 'Signup':
            await signup();
            break;
        case 'Login':
            await login();
            break;
        case 'Exit':
            console.log('Thank you for using the Online Typing Speed Tester CLI. Goodbye!');
            process.exit(0);
    }
    await mainMenu();
}
function getSampleText(difficulty) {
    switch (difficulty) {
        case 'Easy':
            return 'The quick brown fox jumps over the lazy dog.';
        case 'Medium':
            return 'She sells seashells by the seashore.';
        case 'Hard':
            return 'Peter Piper picked a peck of pickled peppers. How many pickled peppers did Peter Piper pick?';
        default:
            return '';
    }
}
async function startApp() {
    await displayWelcomeMessage();
    await mainMenu();
}
startApp();
