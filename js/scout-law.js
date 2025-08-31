// Scout Law Principles
const SCOUT_LAW = [
    {
        principle: "Trustworthy",
        description: "A Scout tells the truth and keeps promises. People can depend on them."
    },
    {
        principle: "Loyal",
        description: "A Scout is true to family, friends, Scout leaders, school, and nation."
    },
    {
        principle: "Helpful",
        description: "A Scout cares about other people and willingly volunteers to help without expecting payment or reward."
    },
    {
        principle: "Friendly",
        description: "A Scout is a friend to all and a brother to every other Scout."
    },
    {
        principle: "Courteous",
        description: "A Scout is polite to everyone regardless of age or position."
    },
    {
        principle: "Kind",
        description: "A Scout knows there is strength in being gentle and treats others as they want to be treated."
    },
    {
        principle: "Obedient",
        description: "A Scout follows the rules of family, school, and troop and obeys the laws of the community and country."
    },
    {
        principle: "Cheerful",
        description: "A Scout looks for the bright side of life and cheerfully does tasks that come their way."
    },
    {
        principle: "Thrifty",
        description: "A Scout works to pay their own way and helps others. They save for the future."
    },
    {
        principle: "Brave",
        description: "A Scout can face danger although they are afraid and stand up for what is right."
    },
    {
        principle: "Clean",
        description: "A Scout keeps their body and mind fit and clean and chooses friends who live by high standards."
    },
    {
        principle: "Reverent",
        description: "A Scout is reverent toward God, faithful in religious duties, and respects the beliefs of others."
    }
];

// Get a random Scout Law principle
function getRandomScoutLaw() {
    const index = Math.floor(Math.random() * SCOUT_LAW.length);
    return SCOUT_LAW[index];
}

// Display Scout Law as background texture
function displayScoutLaw() {
    const scoutLawBackground = document.getElementById('scout-law-background');
    if (!scoutLawBackground) return;
    
    const law = getRandomScoutLaw();
    
    scoutLawBackground.innerHTML = `
        <div class="scout-law-text">
            <div class="scout-law-main">A Scout is ${law.principle}</div>
            <div class="scout-law-sub">${law.description}</div>
        </div>
    `;
}