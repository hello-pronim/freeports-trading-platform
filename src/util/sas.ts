const emojiMapping = [
    ["🐶", "dog"],        //  0
    ["🐱", "cat"],        //  1
    ["🦁", "lion"],       //  2
    ["🐎", "horse"],      //  3
    ["🦄", "unicorn"],    //  4
    ["🐷", "pig"],        //  5
    ["🐘", "elephant"],   //  6
    ["🐰", "rabbit"],     //  7
    ["🐼", "panda"],      //  8
    ["🐓", "rooster"],    //  9
    ["🐧", "penguin"],    // 10
    ["🐢", "turtle"],     // 11
    ["🐟", "fish"],       // 12
    ["🐙", "octopus"],    // 13
    ["🦋", "butterfly"],  // 14
    ["🌷", "flower"],     // 15
    ["🌳", "tree"],       // 16
    ["🌵", "cactus"],     // 17
    ["🍄", "mushroom"],   // 18
    ["🌏", "globe"],      // 19
    ["🌙", "moon"],       // 20
    ["☁️", "cloud"],       // 21
    ["🔥", "fire"],       // 22
    ["🍌", "banana"],     // 23
    ["🍎", "apple"],      // 24
    ["🍓", "strawberry"], // 25
    ["🌽", "corn"],       // 26
    ["🍕", "pizza"],      // 27
    ["🎂", "cake"],       // 28
    ["❤️", "heart"],      // 29
    ["🙂", "smiley"],      // 30
    ["🤖", "robot"],      // 31
    ["🎩", "hat"],        // 32
    ["👓", "glasses"],    // 33
    ["🔧", "spanner"],     // 34
    ["🎅", "santa"],      // 35
    ["👍", "thumbs up"],  // 36
    ["☂️", "umbrella"],    // 37
    ["⌛", "hourglass"],   // 38
    ["⏰", "clock"],      // 39
    ["🎁", "gift"],       // 40
    ["💡", "light bulb"], // 41
    ["📕", "book"],       // 42
    ["✏️", "pencil"],     // 43
    ["📎", "paperclip"],  // 44
    ["✂️", "scissors"],    // 45
    ["🔒", "lock"],       // 46
    ["🔑", "key"],        // 47
    ["🔨", "hammer"],     // 48
    ["☎️", "telephone"],  // 49
    ["🏁", "flag"],       // 50
    ["🚂", "train"],      // 51
    ["🚲", "bicycle"],    // 52
    ["✈️", "aeroplane"],   // 53
    ["🚀", "rocket"],     // 54
    ["🏆", "trophy"],     // 55
    ["⚽", "ball"],       // 56
    ["🎸", "guitar"],     // 57
    ["🎺", "trumpet"],    // 58
    ["🔔", "bell"],       // 59
    ["⚓️", "anchor"],     // 60
    ["🎧", "headphones"], // 61
    ["📁", "folder"],     // 62
    ["📌", "pin"],        // 63
];

function generateEmojiSas(sasBytes: any) {
    const emojis = [
        // just like base64 encoding
        sasBytes[0] >> 2,                               // eslint-disable-line
        (sasBytes[0] & 0x3) << 4 | sasBytes[1] >> 4,    // eslint-disable-line
        (sasBytes[1] & 0xf) << 2 | sasBytes[2] >> 6,    // eslint-disable-line
        sasBytes[2] & 0x3f,                             // eslint-disable-line
        sasBytes[3] >> 2,                               // eslint-disable-line
        (sasBytes[3] & 0x3) << 4 | sasBytes[4] >> 4,    // eslint-disable-line
        (sasBytes[4] & 0xf) << 2 | sasBytes[5] >> 6,    // eslint-disable-line
    ];

    return emojis.map((num) => emojiMapping[num]);
}

export function generateCertificationEmojis(key: string): any {
    const encoded = new TextEncoder().encode(key);
    const sasBytes = encoded.slice(encoded.length - 6, encoded.length);
    return generateEmojiSas(sasBytes);
}